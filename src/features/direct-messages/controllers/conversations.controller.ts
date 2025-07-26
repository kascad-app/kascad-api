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
  ConversationParams,
  ConversationParamsDto,
  GetOrCreateConversationDto,
  GetOrCreateConversationInput,
  GetUserConversationsDto,
  GetUserConversationsQuery,
  GetUserConversationsResponse,
} from "../interfaces/conversation.interfaces";
import { ConversationService } from "../services/conversation.service";

import { Types } from "mongoose";
import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";

@ApiTags("Direct Messages - Conversations")
@ApiBearerAuth()
@Controller("conversations")
@Logged()
export class ConversationsController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get user conversations with participant previews",
    description:
      "Retrieves all conversations for the authenticated user with pagination and optional context filtering. Includes preview information of other participants (name, avatar, etc.)",
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
    description: "Number of conversations per page (max 100)",
    example: 10,
    type: "number",
  })
  @ApiQuery({
    name: "context",
    required: false,
    description: "Filter conversations by context type",
    enum: ["job-offer", "private"],
  })
  @ApiResponse({
    status: 200,
    description:
      "Conversations retrieved successfully with participant previews",
    schema: {
      type: "object",
      properties: {
        conversations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string", description: "Conversation ID" },
              participants: {
                type: "array",
                description: "Array of conversation participants",
                items: {
                  type: "object",
                  properties: {
                    userId: {
                      type: "string",
                      description: "User MongoDB ObjectId",
                    },
                    userType: {
                      type: "string",
                      enum: ["rider", "sponsor"],
                      description: "Type of user",
                    },
                  },
                },
              },
              context: {
                type: "object",
                nullable: true,
                description: "Optional conversation context",
                properties: {
                  type: {
                    type: "string",
                    enum: ["job-offer", "private"],
                    description: "Type of conversation context",
                  },
                  referenceId: {
                    type: "string",
                    description:
                      "Reference ID (e.g., offer ID for job-offer context)",
                  },
                },
              },
              status: {
                type: "string",
                enum: ["active", "inactive", "deleted"],
                description: "Conversation status",
              },
              otherParticipant: {
                type: "object",
                description: "Preview information of the other participant",
                properties: {
                  userId: {
                    type: "string",
                    description: "Other participant's user ID",
                  },
                  userType: {
                    type: "string",
                    enum: ["rider", "sponsor"],
                    description: "Other participant's user type",
                  },
                  displayName: {
                    type: "string",
                    description: "Display name of the other participant",
                  },
                  avatarUrl: {
                    type: "string",
                    description: "Avatar URL of the other participant",
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
                description: "Conversation creation timestamp",
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
              description: "Total number of conversations",
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
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUserConversationsWithPreviews(
    @Query(new ZodValidationPipe(GetUserConversationsDto))
    query: GetUserConversationsQuery,
    @User() user: Rider | Sponsor,
  ): Promise<GetUserConversationsResponse> {
    try {
      const result = await this.conversationService.getUserConversations(
        {
          userId: user._id,
          userType: user.type,
        },
        {
          page: query.page,
          limit: query.limit,
          contextType: query.context,
        },
      );

      this.logger.debug(
        `Retrieved ${result.conversations.length} conversations for user ${user._id}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error retrieving conversations for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Post("get-or-create")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get or create conversation between participants",
    description:
      "Finds an existing conversation between the authenticated user and target user, or creates a new one if none exists. Supports optional context for job offers or other conversation types.",
  })
  @ApiBody({
    description: "Conversation participants and optional context",
    schema: {
      type: "object",
      properties: {
        targetUserId: {
          type: "string",
          description: "MongoDB ObjectId of the target user",
          example: "64f1b2c3d4e5f6g7h8i9j0k1",
        },
        targetUserType: {
          type: "string",
          enum: ["rider", "sponsor"],
          description: "Type of the target user",
        },
        context: {
          type: "object",
          description: "Optional conversation context",
          properties: {
            type: {
              type: "string",
              enum: ["job-offer", "private"],
              description: "Type of conversation context",
            },
            referenceId: {
              type: "string",
              description:
                "Reference ID (e.g., offer ID for job-offer context)",
            },
          },
        },
      },
      required: ["targetUserId", "targetUserType"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Conversation found or created successfully",
    schema: {
      type: "object",
      properties: {
        _id: { type: "string", description: "Conversation ID" },
        participants: {
          type: "array",
          description: "Array of conversation participants",
          items: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                description: "User MongoDB ObjectId",
              },
              userType: {
                type: "string",
                enum: ["rider", "sponsor"],
                description: "Type of user",
              },
            },
          },
        },
        context: {
          type: "object",
          nullable: true,
          description: "Optional conversation context",
          properties: {
            type: {
              type: "string",
              enum: ["job-offer", "private"],
              description: "Type of conversation context",
            },
            referenceId: {
              type: "string",
              description:
                "Reference ID (e.g., offer ID for job-offer context)",
            },
          },
        },
        status: {
          type: "string",
          enum: ["active", "inactive", "deleted"],
          description: "Conversation status",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Conversation creation timestamp",
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
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getOrCreateConversation(
    @Body(new ZodValidationPipe(GetOrCreateConversationDto))
    body: GetOrCreateConversationInput,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const currentParticipant = {
        userId: user._id,
        userType: user.type as ProfileType,
      };

      const targetParticipant = {
        userId: new (Types as any).ObjectId(body.targetUserId),
        userType: body.targetUserType,
      };

      const result = await this.conversationService.getOrCreate(
        currentParticipant,
        targetParticipant,
        body.context
          ? {
              type: body.context.type,
              referenceId: body.context.referenceId,
            }
          : undefined,
      );

      this.logger.debug(
        `Got or created conversation ${result._id} between ${user._id} and ${body.targetUserId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error getting or creating conversation between ${user._id} and ${body.targetUserId}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get conversation by ID",
    description:
      "Retrieves a specific conversation by its ID. Only returns conversations where the authenticated user is a participant and the conversation is active.",
  })
  @ApiParam({
    name: "id",
    description: "Conversation MongoDB ObjectId",
    example: "64f1b2c3d4e5f6g7h8i9j0k1",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Conversation retrieved successfully",
    schema: {
      type: "object",
      properties: {
        _id: { type: "string", description: "Conversation ID" },
        participants: {
          type: "array",
          description: "Array of conversation participants",
          items: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                description: "User MongoDB ObjectId",
              },
              userType: {
                type: "string",
                enum: ["rider", "sponsor"],
                description: "Type of user",
              },
            },
          },
        },
        context: {
          type: "object",
          nullable: true,
          description: "Optional conversation context",
          properties: {
            type: {
              type: "string",
              enum: ["job-offer", "private"],
              description: "Type of conversation context",
            },
            referenceId: {
              type: "string",
              description:
                "Reference ID (e.g., offer ID for job-offer context)",
            },
          },
        },
        status: {
          type: "string",
          enum: ["active", "inactive", "deleted"],
          description: "Conversation status",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Conversation creation timestamp",
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
    description: "Forbidden - User is not a participant in this conversation",
  })
  @ApiResponse({
    status: 404,
    description: "Conversation not found or deleted",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getConversationById(
    @Param(new ZodValidationPipe(ConversationParamsDto))
    params: ConversationParams,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const conversationId = new (Types as any).ObjectId(params.id);
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
          `User ${user._id} attempted to access conversation ${conversationId} without permission`,
        );
        throw new UnauthorizedException(
          "You are not authorized to access this conversation",
        );
      }

      const conversation =
        await this.conversationService.getById(conversationId);

      if (!conversation) {
        this.logger.warn(`Conversation ${conversationId} not found`);
        throw new NotFoundException("Conversation not found");
      }

      this.logger.debug(
        `Retrieved conversation ${conversationId} for user ${user._id}`,
      );

      return conversation;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Error retrieving conversation ${params.id} for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Soft delete conversation",
    description:
      "Marks a conversation as deleted (soft delete). Only participants can delete conversations. The conversation remains in the database but is marked with deleted status.",
  })
  @ApiParam({
    name: "id",
    description: "Conversation MongoDB ObjectId",
    example: "64f1b2c3d4e5f6g7h8i9j0k1",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Conversation deleted successfully",
    schema: {
      type: "object",
      properties: {
        _id: { type: "string", description: "Conversation ID" },
        participants: {
          type: "array",
          description: "Array of conversation participants",
          items: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                description: "User MongoDB ObjectId",
              },
              userType: {
                type: "string",
                enum: ["rider", "sponsor"],
                description: "Type of user",
              },
            },
          },
        },
        context: {
          type: "object",
          nullable: true,
          description: "Optional conversation context",
        },
        status: {
          type: "string",
          enum: ["deleted"],
          description: "Conversation status (will be 'deleted')",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          description: "Conversation creation timestamp",
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
    description: "Forbidden - User is not a participant in this conversation",
  })
  @ApiResponse({
    status: 404,
    description: "Conversation not found or already deleted",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async deleteConversation(
    @Param(new ZodValidationPipe(ConversationParamsDto))
    params: ConversationParams,
    @User() user: Rider | Sponsor,
  ) {
    try {
      const conversationId = new (Types as any).ObjectId(params.id);
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
          `User ${user._id} attempted to delete conversation ${conversationId} without permission`,
        );
        throw new UnauthorizedException(
          "You are not authorized to delete this conversation",
        );
      }

      const deletedConversation =
        await this.conversationService.softDelete(conversationId);

      if (!deletedConversation) {
        this.logger.warn(
          `Conversation ${conversationId} not found for deletion`,
        );
        throw new NotFoundException("Conversation not found");
      }

      this.logger.debug(
        `Soft deleted conversation ${conversationId} by user ${user._id}`,
      );

      return deletedConversation;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Error deleting conversation ${params.id} for user ${user._id}:`,
        error,
      );
      throw new InternalServerErrorException(error);
    }
  }
}
