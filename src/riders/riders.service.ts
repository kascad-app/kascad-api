import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RiderDocument } from "./schemas/rider.schema";

import { AccountStatus, Rider } from "@kascad-app/shared-types";

type RiderSearchParams = {
  [key: string]: string | number | boolean;
};
@Injectable()
export class RidersService {
  constructor(
    @InjectModel("Rider") private readonly _riderModel: Model<RiderDocument>,
  ) {}

  async search(params?: RiderSearchParams): Promise<Rider[]> {
    let query = {};
    if (params) {
      query = {
        $or: Object.entries(params).map(([key, value]) => ({ [key]: value })),
      };
    }
    const riders: Rider[] = await this._riderModel.find(query);
    return riders;
  }

  async findById(id: string): Promise<Rider> {
    return await this._riderModel.findById(id);
  }

  // async create({ email }: { email: string }): Promise<Rider> {
  //   const rider: RiderDocument = await this._riderModel.create({
  //     username,
  //     email,
  //     password,
  //     role: 1,
  //   });
  //   return rider.save();
  // }

  async updateOne(id: string, rider: Partial<Rider>) {
    return await this._riderModel.findByIdAndUpdate(id, rider, { new: true });
  }

  async suspend(id: string, reason: string) {
    const since = new Date();

    return await this._riderModel.findByIdAndUpdate(id, {
      status: {
        status: AccountStatus.SUSPENDED,
        reason,
        since,
      },
    });
  }

  async disable(id: string, reason: string) {
    const since = new Date();

    return await this._riderModel.findByIdAndUpdate(id, {
      status: {
        status: AccountStatus.DISABLED,
        reason,
        since,
      },
    });
  }
}
