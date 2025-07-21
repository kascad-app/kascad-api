import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { ContractType, SportName } from "@kascad-app/shared-types";

import { Schema as MongooseSchema } from "mongoose";

enum OfferStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  EXPIRED = "expired",
  CLOSED = "closed",
  DELETED = "deleted",
}

enum Currency {
  EUR = "EUR",
  USD = "USD",
  GBP = "GBP",
}

interface IOffer {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  sport: string;
  contractType: ContractType;
  sports: SportName[];
  sponsorId: MongooseSchema.Types.ObjectId;
  status: OfferStatus;
  budgetMin?: number;
  budgetMax?: number;
  currency?: Currency;
}

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

  @Prop({ type: String, required: true })
  sport: string;

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
