import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  ContractOffer,
  getContractsDto,
  Message,
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

  async findAll(): Promise<getContractsDto[]> {
    const contractsDto = await this._contractModel
      .aggregate([
        // Join avec la collection sponsors
        {
          $lookup: {
            from: "sponsors", // nom de la collection MongoDB (attention à la casse)
            localField: "authorMail",
            foreignField: "identifier.email",
            as: "authorSponsor",
          },
        },
        // Join avec la collection riders
        {
          $lookup: {
            from: "riders",
            localField: "riderMail",
            foreignField: "identifier.email",
            as: "riderProfile",
          },
        },
        // Déstructure les résultats des lookups (prend le premier résultat)
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
        // Projection des champs voulus
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
            riderName: 1,
            riderAvatar: 1,
            termsAndConditions: 1,
            status: 1,
          },
        },
      ])
      .exec();

    console.log(JSON.stringify(contractsDto, null, 2));
    // Convertir les résultats en getContractsDto

    return contractsDto;
  }

  async findById(id: string): Promise<ContractOffer> {
    return await this._contractModel.findById(id).exec();
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
      authorMail: user.identifier.email,
      content: messageDto.content,
    };

    contractOffer.messages.push(message);
    await contractOffer.save();
    return message;
  }
}
