import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document, Schema as MongooseSchema } from "mongoose";

export type SponsorMessageDocument = SponsorMessage & Document;

@Schema({ timestamps: true })
export class SponsorMessage {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: "Sponsor" })
  sponsorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: "Rider" })
  riderId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  senderEmail: string;

  @Prop({ required: true })
  recipientEmail: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  recipientName: string;

  @Prop({ default: Date.now })
  sentAt: Date;

  @Prop({ enum: ["sent", "delivered", "failed"], default: "sent" })
  status: string;
}

export const SponsorMessageSchema =
  SchemaFactory.createForClass(SponsorMessage);

SponsorMessageSchema.index({ sponsorId: 1, sentAt: -1 });
SponsorMessageSchema.index({ riderId: 1, sentAt: -1 });
SponsorMessageSchema.index({ sponsorId: 1, riderId: 1, sentAt: -1 });
