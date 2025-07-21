import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { ApplicationStatus, ICustomRider } from "@kascad-app/shared-types";

import { Document, Types } from "mongoose";

@Schema({
  toObject: {
    virtuals: true,
    versionKey: false,
  },
})
export class CustomRider implements ICustomRider {
  _id: string;

  @Prop({ type: Types.ObjectId, required: true })
  offerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  riderId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  note: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.PENDING,
  })
  application: ApplicationStatus;
}

export const CustomRiderSchema = SchemaFactory.createForClass(CustomRider);
export type CustomRiderDocument = CustomRider & Document;

CustomRiderSchema.index({ offerId: 1, riderId: 1 });
CustomRiderSchema.index({ offerId: 1, application: 1 });
CustomRiderSchema.index({ offerId: 1, createdAt: -1 });
CustomRiderSchema.index({ application: 1, createdAt: -1 });
