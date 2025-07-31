import {
  ConversationStatus,
  ConversationType,
  PaginationType,
  ProfileType,
} from "@kascad-app/shared-types";

import { MessageType } from "../schemas/messages.schema";

import { Types } from "mongoose";
import { z } from "zod";

// Zod schemas
export const ParticipantDto = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  userType: z.nativeEnum(ProfileType),
});

export const ConversationContextDto = z.object({
  type: z.nativeEnum(ConversationType),
  referenceId: z.string().optional(),
});

export const CreateConversationDto = z.object({
  participantOne: ParticipantDto,
  participantTwo: ParticipantDto,
  context: ConversationContextDto.optional(),
});

export const GetOrCreateConversationDto = z.object({
  targetUserId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  targetUserType: z.nativeEnum(ProfileType),
  context: ConversationContextDto.optional(),
});

export const GetUserConversationsDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  context: z.nativeEnum(ConversationType).optional(),
});

export const ConversationParamsDto = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export type CreateConversationInput = z.infer<typeof CreateConversationDto>;
export type GetOrCreateConversationInput = z.infer<
  typeof GetOrCreateConversationDto
>;
export type GetUserConversationsQuery = z.infer<typeof GetUserConversationsDto>;
export type ConversationParams = z.infer<typeof ConversationParamsDto>;
export type ParticipantInput = z.infer<typeof ParticipantDto>;
export type ConversationContextInput = z.infer<typeof ConversationContextDto>;

export interface CreateConversationServiceInput {
  participantOne: {
    userId: Types.ObjectId;
    userType: ProfileType;
  };
  participantTwo: {
    userId: Types.ObjectId;
    userType: ProfileType;
  };
  context?: {
    type: ConversationType;
    referenceId?: string;
  };
}

export interface ConversationWithParticipants {
  _id: string;
  participants: Array<{
    userId: Types.ObjectId;
    userType: ProfileType;
  }>;
  context?: {
    type: ConversationType;
    referenceId?: string;
  };
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserConversationsServiceQuery {
  page: number;
  limit: number;
  contextType?: ConversationType;
}

export interface ConversationWithParticipantPreview
  extends ConversationWithParticipants {
  otherParticipant: {
    userId: Types.ObjectId;
    userType: ProfileType;
    displayName?: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    companyName?: string;
  };
  lastMessage?: {
    _id: string;
    senderId: Types.ObjectId;
    senderType: ProfileType;
    content: string;
    messageType: MessageType;
    createdAt: Date;
  };
}

export interface GetUserConversationsResponse {
  conversations: ConversationWithParticipantPreview[];
  pagination: PaginationType;
}
