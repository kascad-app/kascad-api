import { PaginationType, ProfileType } from "@kascad-app/shared-types";

import { MessageType } from "../schemas/messages.schema";

import { Types } from "mongoose";
import { z } from "zod";

// Zod schemas
export const CreateMessageDto = z.object({
  conversationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  content: z.string().min(1, "Content cannot be empty").max(5000),
  messageType: z.nativeEnum(MessageType).default(MessageType.TEXT),
});

export const GetMessagesQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const MessageParamsDto = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export const ConversationParamsDto = z.object({
  conversationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export const MarkAsReadDto = z.object({
  messageIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"))
    .min(1, "At least one message ID is required"),
});

// Types
export type CreateMessageInput = z.infer<typeof CreateMessageDto>;
export type GetMessagesQuery = z.infer<typeof GetMessagesQueryDto>;
export type MessageParams = z.infer<typeof MessageParamsDto>;
export type ConversationParams = z.infer<typeof ConversationParamsDto>;
export type MarkAsReadInput = z.infer<typeof MarkAsReadDto>;

// Service interfaces
export interface CreateMessageServiceInput {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderType: ProfileType;
  content: string;
  messageType: MessageType;
}

export interface MessageWithSender {
  _id: string;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderType: ProfileType;
  content: string;
  messageType: MessageType;
  readBy: Array<{
    userId: Types.ObjectId;
    userType: ProfileType;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    userId: Types.ObjectId;
    userType: ProfileType;
    displayName?: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    companyName?: string;
  };
}

export interface GetMessagesServiceQuery {
  conversationId: Types.ObjectId;
  page: number;
  limit: number;
}

export interface GetMessagesResponse {
  messages: MessageWithSender[];
  pagination: PaginationType;
}

export interface UnreadCountByConversation {
  conversationId: Types.ObjectId;
  unreadCount: number;
}
