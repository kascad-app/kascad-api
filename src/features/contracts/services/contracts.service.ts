import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  ContractOffer,
  messagePayloadDto,
  registerMessageDto,
  Rider,
  Sponsor,
} from "@kascad-app/shared-types";
import { ContractOfferDocument } from "../schemas/contract.schema";

type ContractSearchParams = {
  [key: string]: string | number | boolean;
};

@Injectable()
export class ContractsOffersService {
  constructor(
    @InjectModel("ContractOffer")
    private readonly _contractModel: Model<ContractOfferDocument>,
  ) {}

  async search(params?: ContractSearchParams): Promise<ContractOffer[]> {
    let query = {};
    if (params) {
      query = {
        $or: Object.entries(params).map(([key, value]) => ({ [key]: value })),
      };
    }
    return await this._contractModel.find(query).exec();
  }

  async findAll(): Promise<ContractOffer[]> {
    return await this._contractModel.find().exec();
  }

  async findById(id: string): Promise<ContractOffer> {
    return await this._contractModel.findById(id).exec();
  }

  async insertMessage(
    id: string,
    user: Rider | Sponsor,
    messageDto: messagePayloadDto,
  ): Promise<registerMessageDto> {
    const contractOffer = await this._contractModel.findById(id).exec();
    if (!contractOffer) {
      throw new Error("Contract not found");
    }
    if (!user || !user.displayName) {
      throw new Error("User not found or displayName is missing");
    }

    const message: registerMessageDto = {
      authorName: user.displayName,
      content: messageDto.content,
    };

    contractOffer.messages.push(message);
    await contractOffer.save();
    return message;
  }
}
