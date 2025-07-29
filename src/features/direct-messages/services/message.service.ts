import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Participant } from "@kascad-app/shared-types";

import {
  CreateMessageServiceInput,
  GetMessagesResponse,
  GetMessagesServiceQuery,
  UnreadCountByConversation,
} from "../interfaces/message.interfaces";
import { getMessagesByConversationPipeline } from "../pipelines/get-messages-by-conversation.pipeline";
import {
  getUnreadCountPipeline,
  getUnreadMessagesPipeline,
} from "../pipelines/get-unread-messages.pipeline";
import {
  Conversation,
  ConversationDocument,
} from "../schemas/conversation.schema";
import {
  Message,
  MessageDocument,
  MessageStatus,
} from "../schemas/messages.schema";

import { Model, Types } from "mongoose";

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    private readonly logger: Logger,
  ) {}

  async create(input: CreateMessageServiceInput): Promise<MessageDocument> {
    try {
      this.logger.debug("Creating new message");

      const message = new this.messageModel({
        conversationId: input.conversationId,
        senderId: input.senderId,
        senderType: input.senderType,
        content: input.content,
        messageType: input.messageType,
        readBy: [
          {
            userId: input.senderId,
            userType: input.senderType,
            readAt: new Date(),
          },
        ],
      });

      const savedMessage = await message.save();
      this.logger.debug(`Message created: ${savedMessage._id}`);
      return savedMessage;
    } catch (error) {
      this.logger.error("Error creating message:", error);

      if (error.name === "ValidationError") {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }

      throw new InternalServerErrorException("Failed to create message");
    }
  }

  async getByConversationId(
    query: GetMessagesServiceQuery,
  ): Promise<GetMessagesResponse> {
    try {
      this.logger.debug(
        `Getting messages for conversation: ${query.conversationId}`,
      );

      const { conversationId, page, limit } = query;

      const pipeline = getMessagesByConversationPipeline({
        conversationId,
        page,
        limit,
      });

      const result = await this.messageModel.aggregate(pipeline).exec();
      const { messages, total } = result[0] || { messages: [], total: 0 };

      return {
        messages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      this.logger.error("Error getting messages by conversation:", error);
      throw new InternalServerErrorException(
        "Failed to retrieve messages by conversation",
      );
    }
  }

  async getById(messageId: Types.ObjectId): Promise<MessageDocument | null> {
    try {
      this.logger.debug(`Getting message by ID: ${messageId}`);

      const message = await this.messageModel.findById(messageId).lean().exec();

      if (!message) {
        throw new NotFoundException("Message not found");
      }

      return message;
    } catch (error) {
      this.logger.error(`Error getting message ${messageId}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to retrieve message");
    }
  }

  async markAsRead(
    messageIds: Types.ObjectId[],
    participant: Participant,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Marking ${messageIds.length} messages as read for user: ${participant.userId}`,
      );

      await this.messageModel
        .updateMany(
          {
            _id: { $in: messageIds },
            "readBy.userId": { $ne: participant.userId },
          },
          {
            $push: {
              readBy: {
                userId: participant.userId,
                userType: participant.userType,
                readAt: new Date(),
              },
            },
          },
        )
        .exec();

      this.logger.debug("Messages marked as read successfully");
    } catch (error) {
      this.logger.error("Error marking messages as read:", error);
      throw new InternalServerErrorException("Failed to mark messages as read");
    }
  }

  async markAllAsRead(
    conversationId: Types.ObjectId,
    participant: Participant,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Marking all messages as read for conversation: ${conversationId}, user: ${participant.userId}`,
      );

      await this.messageModel
        .updateMany(
          {
            conversationId: conversationId,
            "readBy.userId": { $ne: participant.userId },
          },
          {
            $push: {
              readBy: {
                userId: participant.userId,
                userType: participant.userType,
                readAt: new Date(),
              },
            },
          },
        )
        .exec();

      this.logger.debug("All messages marked as read successfully");
    } catch (error) {
      this.logger.error("Error marking all messages as read:", error);
      throw new InternalServerErrorException(
        "Failed to mark all messages as read",
      );
    }
  }

  async getUnreadCount(participant: Participant): Promise<number> {
    try {
      this.logger.debug(`Getting unread count for user: ${participant.userId}`);

      const pipeline = getUnreadCountPipeline({ participant });
      const result = await this.conversationModel.aggregate(pipeline).exec();

      const totalCount = result[0]?.totalUnreadCount || 0;
      this.logger.debug(`Unread count: ${totalCount}`);
      return totalCount;
    } catch (error) {
      this.logger.error("Error getting unread count:", error);
      throw new InternalServerErrorException("Failed to get unread count");
    }
  }

  async getUnreadCountByConversation(
    participant: Participant,
  ): Promise<UnreadCountByConversation[]> {
    try {
      this.logger.debug(
        `Getting unread count by conversation for user: ${participant.userId}`,
      );

      const pipeline = getUnreadCountPipeline({ participant });
      const result = await this.conversationModel.aggregate(pipeline).exec();

      return result[0]?.conversationsWithUnread || [];
    } catch (error) {
      this.logger.error("Error getting unread count by conversation:", error);
      throw new InternalServerErrorException(
        "Failed to get unread count by conversation",
      );
    }
  }

  async getUnreadMessages(participant: Participant) {
    try {
      this.logger.debug(
        `Getting unread messages for user: ${participant.userId}`,
      );

      const pipeline = getUnreadMessagesPipeline({ participant });
      const result = await this.conversationModel.aggregate(pipeline).exec();

      return result;
    } catch (error) {
      this.logger.error("Error getting unread messages:", error);
      throw new InternalServerErrorException("Failed to get unread messages");
    }
  }

  async softDelete(messageId: Types.ObjectId): Promise<MessageDocument | null> {
    try {
      this.logger.debug(`Soft deleting message: ${messageId}`);

      const deletedMessage = await this.messageModel
        .findByIdAndUpdate(
          messageId,
          { status: MessageStatus.DELETED, updatedAt: new Date() },
          { new: true },
        )
        .lean()
        .exec();

      if (!deletedMessage) {
        throw new NotFoundException("Message not found");
      }

      this.logger.debug(`Message soft deleted: ${messageId}`);
      return deletedMessage;
    } catch (error) {
      this.logger.error(`Error soft deleting message ${messageId}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to soft delete message");
    }
  }
}
