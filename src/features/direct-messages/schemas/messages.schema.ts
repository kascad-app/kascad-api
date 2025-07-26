import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { ProfileType } from "@kascad-app/shared-types";

import type { HydratedDocument } from "mongoose";
import { Types } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

export interface IMessage {
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
}

export type MessageDocument = HydratedDocument<Message>;

@Schema({
  _id: false,
})
class ReadStatus {
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ProfileType),
    required: true,
  })
  userType: ProfileType;

  @Prop({
    type: Date,
    required: true,
  })
  readAt: Date;
}

@Schema({
  _id: true,
})
export class Message implements IMessage {
  _id: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: "Conversation",
  })
  conversationId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  senderId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ProfileType),
    required: true,
  })
  senderType: ProfileType;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Prop({
    type: [ReadStatus],
    default: [],
  })
  readBy: Array<{
    userId: Types.ObjectId;
    userType: ProfileType;
    readAt: Date;
  }>;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass<Message>(Message);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ "readBy.userId": 1 });
MessageSchema.index({
  conversationId: 1,
  createdAt: -1,
  messageType: 1,
});

MessageSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

MessageSchema.pre("updateOne", function (next) {
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});
