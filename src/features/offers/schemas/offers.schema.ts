import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import {
  ContractType,
  Currency,
  IOffer,
  OfferStatus,
  SportName,
} from "@kascad-app/shared-types";

import { Schema as MongooseSchema } from "mongoose";

@Schema({
  toObject: {
    virtuals: true,
    versionKey: false,
  },
})
export class Offer implements IOffer {
  _id: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
  @Prop({
    type: String,
    required: true,
    enum: Object.values(ContractType),
  })
  contractType: ContractType;

  @Prop({ type: [String], required: true })
  sports: SportName[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  sponsorId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OfferStatus),
    default: OfferStatus.DRAFT,
  })
  status: OfferStatus;

  @Prop({ type: Number, min: 0 })
  budgetMin?: number;

  @Prop({ type: Number, min: 0 })
  budgetMax?: number;

  @Prop({
    type: String,
    enum: Object.values(Currency),
    default: Currency.EUR,
  })
  currency?: Currency;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

OfferSchema.index({ sponsorId: 1, status: 1 });
OfferSchema.index({ sponsorId: 1, createdAt: -1 });
OfferSchema.index({ status: 1, createdAt: -1 });
