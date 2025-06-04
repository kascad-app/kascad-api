import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import {
  type ContractOffer as IContractOffer,
  ContractStatus,
  ContractType,
  Message as MessageType,
  ProfileType,
} from "@kascad-app/shared-types";

import { HydratedDocument } from "mongoose";

export type ContractOfferDocument = HydratedDocument<ContractOffer>;

@Schema({
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  toJSON: {
    virtuals: true,
    versionKey: false,
  },
  id: true,
  minimize: false,
})
export class Message implements MessageType {
  _id: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: String, required: true })
  authorMail: string;

  @Prop({ type: String, required: true, enum: Object.values(ProfileType) })
  authorType: ProfileType;

  @Prop({ type: String, required: true })
  content;
}

@Schema({
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  toJSON: {
    virtuals: true,
    versionKey: false,
  },
  id: true,
  minimize: false,
})
export class ContractOffer implements IContractOffer {
  _id: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String, required: true })
  authorMail: string;

  @Prop({ type: Boolean, default: true })
  isNew: boolean;

  @Prop({ type: String, required: true, enum: Object.values(ContractType) })
  type: ContractType;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  sport?: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: String, required: true })
  riderMail: string;

  @Prop({ type: String })
  termsAndConditions?: string;

  @Prop({ type: [String] })
  perks?: string[];

  @Prop({ type: String, enum: Object.values(ContractStatus) })
  status: ContractStatus;

  @Prop({ type: [Message], default: [] })
  messages: MessageType[];
}

export const ContractOfferSchema =
  SchemaFactory.createForClass<ContractOffer>(ContractOffer);

ContractOfferSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

ContractOfferSchema.pre("updateOne", function (next) {
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});
