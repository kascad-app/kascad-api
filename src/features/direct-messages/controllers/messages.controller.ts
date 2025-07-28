import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { ProfileType, Rider, Sponsor } from "@kascad-app/shared-types";

import {
  CreateMessageDto,
  CreateMessageInput,
  GetMessageConversationParams,
  GetMessageConversationParamsDto,
  GetMessagesQuery,
  GetMessagesQueryDto,
  MarkAsReadDto,
  MarkAsReadInput,
  MessageParams,
  MessageParamsDto,
} from "../interfaces/message.interfaces";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";

import mongoose from "mongoose";
import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";

@ApiTags("Direct Messages - Messages")
@ApiBearerAuth()
@Controller("messages")
@Logged()
export class MessagesController {
  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create a new message",
    description:
      "Creates a new message in the specified conversation. The sender is automatically marked as having read the message.",
  })
  @ApiBody({
    description: "Message content and conversation details",
    schema: {
      type: "object",
      properties: {
        conversationId: {
          type: "string",
          description: "MongoDB ObjectId of the conversation",
          example: "64f1b2c3d4e5f6g7h8i9j0k1",
        },
        content: {
          type: "string",
          description: "Message content",
          example: "Hello, I'm interested in your offer!",
          minLength: 1,
          maxLength: 5000,
        },
        messageType: {
          type: "string",
          enum: ["text", "image", "file"],
          description: "Type of message",
          default: "text",
        },
      },
      required: ["conversationId", "content"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Message created successfully",
    schema: {
      type: "object",
      properties: {
        _id: { type: "string", description: "Message ID" },
        conversationId: {
          type: "string",
          description: "Conversation ID",
        },
        senderId: { type: "string", description: "Sender user ID" },
        senderType: {
          type: "string",
          enum: ["rider", "sponsor"],
          description: "Sender user type",
        },
        content: { type: "string", description: "Message content" },
        messageType: {
          type: "string",
          enum: ["text", "image", "file"],
          description: "Type of message",
        },
        readBy: {
          type: "array",
          description: "Array of users who have read the message",
          items: {
            type: "object",
            properties: {
              userId: { type: "string", description: "User ID" },
              userType: {
                type: "string",
                enum: ["rider", "sponsor"],
                description: "User type",
              },
              readAt: {
                type: "string",
                format: "date-time",
                description: "Read timestamp",
              },
            },
          },
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Creation timestamp",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          description: "Last update timestamp",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid input data",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - User is not a participant in the conversation",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createMessage(
    @Body(new ZodValidationPipe(CreateMessageDto))
    body: CreateMessageInput,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const conversationId = new (mongoose as any).Types.ObjectId(
        body.conversationId,
      );
      const userParticipant = {
        userId: user._id,
        userType: user.type as ProfileType,
      };

      const isUserInConversation = await this.conversationService.verifyUser(
        conversationId,
        userParticipant,
      );

      if (!isUserInConversation) {
        this.logger.warn(
          `User ${user._id} attempted to send message to conversation ${conversationId} without permission`,
        );
        throw new UnauthorizedException(
          "You are not authorized to send messages to this conversation",
        );
      }

      const message = await this.messageService.create({
        conversationId,
        senderId: user._id,
        senderType: user.type as ProfileType,
        content: body.content,
        messageType: body.messageType,
      });

      this.logger.debug(
        `Message created: ${message._id} in conversation ${conversationId} by user ${user._id}`,
      );

      return message;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Error creating message for user ${user._id}:`, error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get("conversations/:conversationId")
  @ApiOperation({
    summary: "Get messages from a conversation",
    description:
      "Retrieves all messages from the specified conversation with pagination. Includes sender information (name, avatar, etc.) for each message.",
  })
  @ApiParam({
    name: "conversationId",
    description: "Conversation MongoDB ObjectId",
    example: "64f1b2c3d4e5f6g7h8i9j0k1",
    type: "string",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    example: 1,
    type: "number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of messages per page (max 100)",
    example: 20,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Messages retrieved successfully",
    schema: {
      type: "object",
      properties: {
        messages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string", description: "Message ID" },
              conversationId: {
                type: "string",
                description: "Conversation ID",
              },
              senderId: { type: "string", description: "Sender user ID" },
              senderType: {
                type: "string",
                enum: ["rider", "sponsor"],
                description: "Sender user type",
              },
              content: { type: "string", description: "Message content" },
              messageType: {
                type: "string",
                enum: ["text", "image", "file"],
                description: "Type of message",
              },
              readBy: {
                type: "array",
                description: "Array of users who have read the message",
              },
              sender: {
                type: "object",
                description: "Sender information",
                properties: {
                  userId: { type: "string", description: "Sender user ID" },
                  userType: {
                    type: "string",
                    enum: ["rider", "sponsor"],
                    description: "Sender user type",
                  },
                  displayName: {
                    type: "string",
                    description: "Sender display name",
                  },
                  avatarUrl: {
                    type: "string",
                    description: "Sender avatar URL",
                  },
                  firstName: {
                    type: "string",
                    description: "First name (for riders)",
                  },
                  lastName: {
                    type: "string",
                    description: "Last name (for riders)",
                  },
                  fullName: {
                    type: "string",
                    description: "Full name (for riders)",
                  },
                  companyName: {
                    type: "string",
                    description: "Company name (for sponsors)",
                  },
                },
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Last update timestamp",
              },
            },
          },
        },
        pagination: {
          type: "object",
          description: "Pagination information",
          properties: {
            currentPage: { type: "number", description: "Current page number" },
            totalPages: {
              type: "number",
              description: "Total number of pages",
            },
            totalItems: {
              type: "number",
              description: "Total number of messages",
            },
            itemsPerPage: {
              type: "number",
              description: "Number of items per page",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - User is not a participant in the conversation",
  })
  @ApiResponse({
    status: 404,
    description: "Conversation not found",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getMessagesByConversation(
    @Param(new ZodValidationPipe(GetMessageConversationParamsDto))
    params: GetMessageConversationParams,
    @Query(new ZodValidationPipe(GetMessagesQueryDto))
    query: GetMessagesQuery,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const conversationId = new (mongoose as any).Types.ObjectId(
        params.conversationId,
      );

      const userParticipant = {
        userId: user._id,
        userType: user.type as ProfileType,
      };

      const isUserInConversation = await this.conversationService.verifyUser(
        conversationId,
        userParticipant,
      );

      if (!isUserInConversation) {
        this.logger.warn(
          `User ${user._id} attempted to access messages from conversation ${conversationId} without permission`,
        );
        throw new UnauthorizedException(
          "You are not authorized to access messages from this conversation",
        );
      }

      const result = await this.messageService.getByConversationId({
        conversationId,
        page: query.page,
        limit: query.limit,
      });

      this.logger.debug(
        `Retrieved ${result.messages.length} messages from conversation ${conversationId} for user ${user._id}`,
      );

      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Error retrieving messages from conversation ${params.conversationId} for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get message by ID",
    description:
      "Retrieves a specific message by its ID. Only accessible to users who are participants in the message's conversation.",
  })
  @ApiParam({
    name: "id",
    description: "Message MongoDB ObjectId",
    example: "64f1b2c3d4e5f6g7h8i9j0k1",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Message retrieved successfully",
    schema: {
      type: "object",
      properties: {
        _id: { type: "string", description: "Message ID" },
        conversationId: { type: "string", description: "Conversation ID" },
        senderId: { type: "string", description: "Sender user ID" },
        senderType: {
          type: "string",
          enum: ["rider", "sponsor"],
          description: "Sender user type",
        },
        content: { type: "string", description: "Message content" },
        messageType: {
          type: "string",
          enum: ["text", "image", "file"],
          description: "Type of message",
        },
        readBy: {
          type: "array",
          description: "Array of users who have read the message",
          items: {
            type: "object",
            properties: {
              userId: { type: "string", description: "User ID" },
              userType: {
                type: "string",
                enum: ["rider", "sponsor"],
                description: "User type",
              },
              readAt: {
                type: "string",
                format: "date-time",
                description: "Read timestamp",
              },
            },
          },
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Creation timestamp",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          description: "Last update timestamp",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - User is not a participant in the conversation",
  })
  @ApiResponse({
    status: 404,
    description: "Message not found",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getMessageById(
    @Param(new ZodValidationPipe(MessageParamsDto))
    params: MessageParams,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const messageId = new (mongoose as any).Types.ObjectId(params.id);

      const message = await this.messageService.getById(messageId);

      if (!message) {
        this.logger.warn(`Message ${messageId} not found`);
        throw new NotFoundException("Message not found");
      }

      const userParticipant = {
        userId: user._id,
        userType: user.type as ProfileType,
      };

      const isUserInConversation = await this.conversationService.verifyUser(
        message.conversationId,
        userParticipant,
      );

      if (!isUserInConversation) {
        this.logger.warn(
          `User ${user._id} attempted to access message ${messageId} without permission`,
        );
        throw new UnauthorizedException(
          "You are not authorized to access this message",
        );
      }

      this.logger.debug(`Retrieved message ${messageId} for user ${user._id}`);

      return message;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Error retrieving message ${params.id} for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Soft delete message",
    description:
      "Marks a message as deleted by replacing its content with '[Message deleted]'. Only the message sender can delete their own messages.",
  })
  @ApiParam({
    name: "id",
    description: "Message MongoDB ObjectId",
    example: "64f1b2c3d4e5f6g7h8i9j0k1",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Message deleted successfully",
    schema: {
      type: "object",
      properties: {
        _id: { type: "string", description: "Message ID" },
        conversationId: { type: "string", description: "Conversation ID" },
        senderId: { type: "string", description: "Sender user ID" },
        senderType: {
          type: "string",
          enum: ["rider", "sponsor"],
          description: "Sender user type",
        },
        content: {
          type: "string",
          description: "Message content (will be '[Message deleted]')",
        },
        messageType: {
          type: "string",
          enum: ["text", "image", "file"],
          description: "Type of message",
        },
        readBy: {
          type: "array",
          description: "Array of users who have read the message",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Creation timestamp",
        },
        updatedAt: {
          type: "string",
          format: "date-time",
          description: "Last update timestamp",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - User is not the sender of this message",
  })
  @ApiResponse({
    status: 404,
    description: "Message not found",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async deleteMessage(
    @Param(new ZodValidationPipe(MessageParamsDto))
    params: MessageParams,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const messageId = new (mongoose as any).Types.ObjectId(params.id);

      const message = await this.messageService.getById(messageId);

      if (!message) {
        this.logger.warn(`Message ${messageId} not found for deletion`);
        throw new NotFoundException("Message not found");
      }

      if (message.senderId.toString() !== user._id.toString()) {
        this.logger.warn(
          `User ${user._id} attempted to delete message ${messageId} they didn't send`,
        );
        throw new UnauthorizedException(
          "You can only delete your own messages",
        );
      }

      const deletedMessage = await this.messageService.softDelete(messageId);

      if (!deletedMessage) {
        this.logger.warn(`Failed to delete message ${messageId}`);
        throw new NotFoundException("Message not found");
      }

      this.logger.debug(
        `Soft deleted message ${messageId} by user ${user._id}`,
      );

      return deletedMessage;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Error deleting message ${params.id} for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Patch("mark-read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Mark messages as read",
    description:
      "Marks the specified messages as read by the authenticated user. Only marks messages that haven't been read by this user yet.",
  })
  @ApiBody({
    description: "Array of message IDs to mark as read",
    schema: {
      type: "object",
      properties: {
        messageIds: {
          type: "array",
          items: {
            type: "string",
            description: "Message MongoDB ObjectId",
            example: "64f1b2c3d4e5f6g7h8i9j0k1",
          },
          minItems: 1,
          description: "Array of message IDs to mark as read",
        },
      },
      required: ["messageIds"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Messages marked as read successfully",
    schema: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          description: "Operation success status",
          example: true,
        },
        message: {
          type: "string",
          description: "Success message",
          example: "Messages marked as read successfully",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid input data",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async markMessagesAsRead(
    @Body(new ZodValidationPipe(MarkAsReadDto))
    body: MarkAsReadInput,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const messageIds = body.messageIds.map(
        (id) => new (mongoose as any).Types.ObjectId(id),
      );
      const userParticipant = {
        userId: user._id,
        userType: user.type as ProfileType,
      };

      await this.messageService.markAsRead(messageIds, userParticipant);

      this.logger.debug(
        `Marked ${messageIds.length} messages as read for user ${user._id}`,
      );

      return {
        success: true,
        message: "Messages marked as read successfully",
      };
    } catch (error) {
      this.logger.error(
        `Error marking messages as read for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Patch("conversations/:conversationId/mark-all-read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Mark all messages in conversation as read",
    description:
      "Marks all unread messages in the specified conversation as read by the authenticated user.",
  })
  @ApiParam({
    name: "conversationId",
    description: "Conversation MongoDB ObjectId",
    example: "64f1b2c3d4e5f6g7h8i9j0k1",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "All messages in conversation marked as read successfully",
    schema: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          description: "Operation success status",
          example: true,
        },
        message: {
          type: "string",
          description: "Success message",
          example: "All messages marked as read successfully",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - User is not a participant in the conversation",
  })
  @ApiResponse({
    status: 404,
    description: "Conversation not found",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async markAllMessagesAsRead(
    @Param(new ZodValidationPipe(GetMessageConversationParamsDto))
    params: GetMessageConversationParams,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const conversationId = new (mongoose as any).Types.ObjectId(
        params.conversationId,
      );
      const userParticipant = {
        userId: user._id,
        userType: user.type as ProfileType,
      };

      const isUserInConversation = await this.conversationService.verifyUser(
        conversationId,
        userParticipant,
      );

      if (!isUserInConversation) {
        this.logger.warn(
          `User ${user._id} attempted to mark all messages as read in conversation ${conversationId} without permission`,
        );
        throw new UnauthorizedException(
          "You are not authorized to mark messages in this conversation as read",
        );
      }

      await this.messageService.markAllAsRead(conversationId, userParticipant);

      this.logger.debug(
        `Marked all messages as read in conversation ${conversationId} for user ${user._id}`,
      );

      return {
        success: true,
        message: "All messages marked as read successfully",
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Error marking all messages as read in conversation ${params.conversationId} for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Get("unread-count")
  @ApiOperation({
    summary: "Get total unread message count",
    description:
      "Returns the total number of unread messages for the authenticated user across all conversations.",
  })
  @ApiResponse({
    status: 200,
    description: "Unread count retrieved successfully",
    schema: {
      type: "object",
      properties: {
        unreadCount: {
          type: "number",
          description: "Total number of unread messages",
          example: 15,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUnreadCount(@User() user: Rider | Sponsor) {
    try {
      const userParticipant = {
        userId: user._id,
        userType: user.type as ProfileType,
      };

      const unreadCount =
        await this.messageService.getUnreadCount(userParticipant);

      this.logger.debug(
        `Retrieved unread count: ${unreadCount} for user ${user._id}`,
      );

      return { unreadCount };
    } catch (error) {
      this.logger.error(
        `Error getting unread count for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Get("conversations/unread-counts")
  @ApiOperation({
    summary: "Get unread message counts by conversation",
    description:
      "Returns the number of unread messages for each conversation for the authenticated user. Useful for displaying badges in conversation lists.",
  })
  @ApiResponse({
    status: 200,
    description: "Unread counts by conversation retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          conversationId: {
            type: "string",
            description: "Conversation MongoDB ObjectId",
            example: "64f1b2c3d4e5f6g7h8i9j0k1",
          },
          unreadCount: {
            type: "number",
            description: "Number of unread messages in this conversation",
            example: 3,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing authentication token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUnreadCountsByConversation(@User() user: Rider | Sponsor) {
    try {
      const userParticipant = {
        userId: user._id,
        userType: user.type as ProfileType,
      };

      const unreadCounts =
        await this.messageService.getUnreadCountByConversation(userParticipant);

      this.logger.debug(
        `Retrieved unread counts for ${unreadCounts.length} conversations for user ${user._id}`,
      );

      return unreadCounts;
    } catch (error) {
      this.logger.error(
        `Error getting unread counts by conversation for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }
}
