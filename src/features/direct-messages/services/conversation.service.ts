import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
  ConversationStatus,
  ConversationType,
  PaginationType,
  Participant,
} from "@kascad-app/shared-types";

import { getFindExistingConversationPipeline } from "../aggregates/find-existing-conversation.aggregate";
import { getUserConversationsPipeline } from "../aggregates/get-user-conversations.aggregate";
import {
  ConversationWithParticipantPreview,
  ConversationWithParticipants,
  CreateConversationServiceInput,
  UserConversationsServiceQuery,
} from "../interfaces/conversation.interfaces";
import {
  Conversation,
  ConversationDocument,
} from "../schemas/conversation.schema";

import { Model, Types } from "mongoose";

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    private readonly logger: Logger,
  ) {}

  async getOrCreate(
    currentParticipant: Participant,
    targetParticipant: Participant,
    context?: { type: ConversationType; referenceId?: string },
  ): Promise<ConversationWithParticipants> {
    this.logger.debug(
      `Getting or creating conversation between ${currentParticipant.userId} and ${targetParticipant.userId}`,
    );

    const pipeline = getFindExistingConversationPipeline({
      currentParticipant,
      targetParticipant,
      contextType: context?.type,
    });

    const existingConversations = await this.conversationModel
      .aggregate(pipeline)
      .exec();

    const existingConversation = existingConversations[0] || null;

    if (existingConversation) {
      this.logger.debug(
        `Found existing conversation: ${existingConversation._id}`,
      );
      return existingConversation;
    }

    const createInput: CreateConversationServiceInput = {
      participantOne: {
        userId: currentParticipant.userId,
        userType: currentParticipant.userType,
      },
      participantTwo: {
        userId: targetParticipant.userId,
        userType: targetParticipant.userType,
      },
      context: context,
    };

    const newConversation = await this.create(createInput);
    this.logger.debug(`Created new conversation: ${newConversation._id}`);

    return newConversation;
  }

  async create(
    input: CreateConversationServiceInput,
  ): Promise<ConversationWithParticipants> {
    this.logger.debug("Creating new conversation");

    const conversation = new this.conversationModel({
      participants: [input.participantOne, input.participantTwo],
      context: input.context,
      status: ConversationStatus.ACTIVE,
    });

    return await conversation.save();
  }

  async getUserConversations(
    participant: Participant,
    query: UserConversationsServiceQuery,
  ): Promise<{
    conversations: ConversationWithParticipantPreview[];
    pagination: PaginationType;
  }> {
    this.logger.debug(`Getting conversations for user: ${participant.userId}`);

    const { page, limit, contextType } = query;

    const pipeline = getUserConversationsPipeline({
      participant: {
        userId: participant.userId,
        userType: participant.userType,
      },
      page,
      limit,
      contextType,
    });

    const result = await this.conversationModel.aggregate(pipeline).exec();
    const { conversations, total } = result[0] || {
      conversations: [],
      total: 0,
    };

    return {
      conversations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getById(
    conversationId: Types.ObjectId,
  ): Promise<ConversationWithParticipants | null> {
    this.logger.debug(`Getting conversation by ID: ${conversationId}`);

    return await this.conversationModel
      .findOne({
        _id: conversationId,
        status: ConversationStatus.ACTIVE,
      })
      .lean()
      .exec();
  }

  async softDelete(
    conversationId: Types.ObjectId,
  ): Promise<ConversationWithParticipants | null> {
    this.logger.debug(`Soft deleting conversation: ${conversationId}`);

    return await this.conversationModel
      .findByIdAndUpdate(
        conversationId,
        { status: ConversationStatus.DELETED, updatedAt: new Date() },
        { new: true },
      )
      .lean()
      .exec();
  }

  async verifyUser(
    conversationId: Types.ObjectId,
    participant: Participant,
  ): Promise<boolean> {
    return !!(await this.conversationModel
      .findOne({
        _id: conversationId,
        status: ConversationStatus.ACTIVE,
        participants: {
          $elemMatch: {
            userId: participant.userId,
            userType: participant.userType,
          },
        },
      })
      .lean()
      .exec());
  }
}
