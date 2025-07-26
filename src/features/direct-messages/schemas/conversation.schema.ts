import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { ProfileType } from "@kascad-app/shared-types";

import type { HydratedDocument } from "mongoose";
import { Types } from "mongoose";

export enum ConversationType {
  JOB_OFFER = "job-offer",
  PRIVATE = "private",
}

export interface IConversation {
  _id: string;
  participants: Array<{
    userId: Types.ObjectId;
    userType: ProfileType;
  }>;
  context?: {
    type: ConversationType;
    referenceId?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({
  _id: false,
})
class Participant {
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
}

@Schema({
  _id: false,
})
class ConversationContext {
  @Prop({
    type: String,
    enum: Object.values(ConversationType),
    required: true,
  })
  type: ConversationType;

  @Prop({
    type: String,
  })
  referenceId?: string;
}

@Schema({
  _id: true,
})
export class Conversation implements IConversation {
  _id: string;

  @Prop({
    type: [Participant],
    required: true,
    validate: {
      validator: function (participants: Participant[]) {
        return participants.length === 2;
      },
      message: "A conversation must have exactly 2 participants",
    },
  })
  participants: Array<{
    userId: Types.ObjectId;
    userType: ProfileType;
  }>;

  @Prop({
    type: ConversationContext,
  })
  context?: {
    type: ConversationType;
    referenceId?: string;
  };

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

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

export const ConversationSchema =
  SchemaFactory.createForClass<Conversation>(Conversation);

ConversationSchema.index({ "participants.userId": 1 });
ConversationSchema.index({ isActive: 1 });
ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({
  "participants.userId": 1,
  isActive: 1,
});

ConversationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

ConversationSchema.pre("updateOne", function (next) {
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});
