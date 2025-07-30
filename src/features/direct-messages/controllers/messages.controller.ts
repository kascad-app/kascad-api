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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { ProfileType, Rider, Sponsor } from "@kascad-app/shared-types";

import {
  ApiSwaggerCreateMessage,
  ApiSwaggerDeleteMessage,
  ApiSwaggerGetMessageById,
  ApiSwaggerGetMessages,
  ApiSwaggerGetUnreadCount,
  ApiSwaggerGetUnreadCountsByConversation,
  ApiSwaggerMarkAllAsRead,
  ApiSwaggerMarkAsRead,
} from "../decorators/messages-swagger.decorators";
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
  @ApiSwaggerCreateMessage()
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
  @ApiSwaggerGetMessages()
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
        participant: {
          userId: user._id,
          userType: user.type as ProfileType,
        },
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
  @ApiSwaggerGetMessageById()
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
  @ApiSwaggerDeleteMessage()
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
  @ApiSwaggerMarkAsRead()
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
  @ApiSwaggerMarkAllAsRead()
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
  @ApiSwaggerGetUnreadCount()
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
  @ApiSwaggerGetUnreadCountsByConversation()
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
