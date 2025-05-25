import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { ContractOffer } from "@kascad-app/shared-types";
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
}
