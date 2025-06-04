import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
  ContractOffer,
  contractOfferDto,
  Message,
  ProfileType,
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

  async findAll(): Promise<contractOfferDto[]> {
    return await this._contractModel
      .aggregate([
        {
          $lookup: {
            from: "sponsors",
            localField: "sponsorMail",
            foreignField: "identifier.email",
            as: "sponsor",
          },
        },
        {
          $lookup: {
            from: "riders",
            localField: "riderMail",
            foreignField: "identifier.email",
            as: "rider",
          },
        },
        {
          $addFields: {
            sponsorAvatar: { $arrayElemAt: ["$sponsor.avatarUrl", 0] },
            sponsorName: {
              $arrayElemAt: ["$sponsor.identity.companyName", 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            sponsorMail: 1,
            sponsorName: 1,
            sponsorAvatar: 1,
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

  async findById(id: string): Promise<contractOfferDto> {
    const result = await this._contractModel
      .aggregate([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { $match: { _id: new (mongoose as any).Types.ObjectId(id) } },
        {
          $lookup: {
            from: "sponsors",
            localField: "sponsorMail",
            foreignField: "identifier.email",
            as: "sponsor",
          },
        },
        {
          $lookup: {
            from: "riders",
            localField: "riderMail",
            foreignField: "identifier.email",
            as: "rider",
          },
        },
        {
          $addFields: {
            sponsorAvatar: { $arrayElemAt: ["$sponsor.avatarUrl", 0] },
            sponsorName: {
              $arrayElemAt: ["$sponsor.identity.companyName", 0],
            },
            riderName: {
              $arrayElemAt: ["$rider.identity.fullName", 0],
            },
            riderAvatar: { $arrayElemAt: ["$rider.avatarUrl", 0] },
          },
        },
        {
          $project: {
            _id: 0,
            sponsorMail: 1,
            sponsorName: 1,
            sponsorAvatar: 1,
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
    return result[0] as contractOfferDto;
  }

  async messageViewedBy(id: string, user: Rider | Sponsor): Promise<void> {
    const contractOffer = await this._contractModel.findById(id).exec();
    if (!contractOffer) {
      throw new Error("Contract not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    if (user.type === ProfileType.RIDER) {
      contractOffer.isOpenByRider = true;
    } else if (user.type === ProfileType.SPONSOR) {
      contractOffer.isOpenBySponsor = true;
    }
    await contractOffer.save();
  }

  async create(createContractOfferDto: ContractOffer): Promise<ContractOffer> {
    const newContractOffer = new this._contractModel(createContractOfferDto);
    return await newContractOffer.save();
  }

  async countNewMessagesForRider(riderMail: string): Promise<number> {
    return this._contractModel
      .countDocuments({
        riderMail,
        isOpenByRider: false,
      })
      .exec();
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
    if (user.type === ProfileType.RIDER) {
      contractOffer.isOpenByRider = true;
      contractOffer.isOpenBySponsor = false;
    } else if (user.type === ProfileType.SPONSOR) {
      contractOffer.isOpenBySponsor = true;
      contractOffer.isOpenByRider = false;
    }
    await contractOffer.save();
    return message;
  }
}
