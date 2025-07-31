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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { ProfileType, Rider, Sponsor } from "@kascad-app/shared-types";

import {
  ApiSwaggerCreateConversation,
  ApiSwaggerDeleteConversation,
  ApiSwaggerGetConversationById,
  ApiSwaggerGetUserConversations,
} from "../decorators/conversations-swagger.decorators";
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
  @ApiSwaggerGetUserConversations()
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
  @ApiSwaggerCreateConversation()
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
  @ApiSwaggerGetConversationById()
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
  @ApiSwaggerDeleteConversation()
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
