import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
  ContractOffer,
  getContractsDto,
  Message,
  registerMessageDto,
  Rider,
  Sponsor,
} from "@kascad-app/shared-types";

import { ContractOfferDocument } from "../schemas/contract.schema";

import mongoose, { Model } from "mongoose";

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

  async findAll(): Promise<getContractsDto[]> {
    return await this._contractModel
      .aggregate([
        {
          $lookup: {
            from: "sponsors",
            localField: "authorMail",
            foreignField: "identifier.email",
            as: "authorSponsor",
          },
        },
        {
          $lookup: {
            from: "riders",
            localField: "riderMail",
            foreignField: "identifier.email",
            as: "riderProfile",
          },
        },
        {
          $addFields: {
            authorAvatar: { $arrayElemAt: ["$authorSponsor.avatarUrl", 0] },
            authorName: {
              $arrayElemAt: ["$authorSponsor.identity.companyName", 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            authorMail: 1,
            authorName: 1,
            authorAvatar: 1,
            isNew: 1,
            type: 1,
            title: 1,
            description: 1,
            sport: 1,
            riderMail: 1,
            termsAndConditions: 1,
            status: 1,
          },
        },
      ])
      .exec();

    // TODO filter by rider's mail
  }

  async findById(id: string): Promise<getContractsDto> {
    const result = await this._contractModel
      .aggregate([
        { $match: { _id: new (mongoose as any).Types.ObjectId(id) } },
        {
          $lookup: {
            from: "sponsors",
            localField: "authorMail",
            foreignField: "identifier.email",
            as: "authorSponsor",
          },
        },
        {
          $lookup: {
            from: "riders",
            localField: "riderMail",
            foreignField: "identifier.email",
            as: "riderProfile",
          },
        },
        {
          $addFields: {
            authorAvatar: { $arrayElemAt: ["$authorSponsor.avatarUrl", 0] },
            authorName: {
              $arrayElemAt: ["$authorSponsor.identity.companyName", 0],
            },
            riderName: {
              $arrayElemAt: ["$riderProfile.identity.fullName", 0],
            },
            riderAvatar: { $arrayElemAt: ["$riderProfile.avatarUrl", 0] },
          },
        },
        {
          $project: {
            _id: 0,
            authorMail: 1,
            authorName: 1,
            authorAvatar: 1,
            isNew: 1,
            type: 1,
            title: 1,
            description: 1,
            sport: 1,
            startDate: 1,
            endDate: 1,
            riderMail: 1,
            riderName: 1,
            riderAvatar: 1,
            termsAndConditions: 1,
            perks: 1,
            status: 1,
            messages: 1,
          },
        },
      ])
      .exec();
    return result[0] as getContractsDto;
  }

  async create(createContractOfferDto: ContractOffer): Promise<ContractOffer> {
    const newContractOffer = new this._contractModel(createContractOfferDto);
    return await newContractOffer.save();
  }

  async insertMessage(
    id: string,
    user: Rider | Sponsor,
    messageDto: registerMessageDto,
  ): Promise<Message> {
    const contractOffer = await this._contractModel.findById(id).exec();
    if (!contractOffer) {
      throw new Error("Contract not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    const message: Message = {
      authorType: user.type,
      authorMail: user.identifier.email,
      content: messageDto.content,
    };

    contractOffer.messages.push(message);
    await contractOffer.save();
    return message;
  }
}
