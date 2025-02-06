import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RiderDocument } from "./schemas/rider.schema";

import {
  AccountStatus,
  GenderIdentity,
  registerRiderDto,
  Rider,
  RiderIdentity,
} from "@kascad-app/shared-types";

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

  async findAll(): Promise<Rider[]> {
    return await this._riderModel.find().exec();
  }

  async findById(id: string): Promise<Rider> {
    return await this._riderModel.findById(id);
  }

  async aggregate(pipeline: any[]): Promise<Rider[]> {
    return await this._riderModel.aggregate(pipeline).exec();
  }

  async create(registerDto: registerRiderDto): Promise<Rider> {
    const newRider = new this._riderModel({
      password: registerDto.password,
      type: registerDto.type,
    });

    newRider.identifier = { email: registerDto.email };

    newRider.identity = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      fullName: `${registerDto.firstName} ${registerDto.lastName}`,
      gender: registerDto.gender,
      birthDate: registerDto.birthDate,
      country: "",
      languageSpoken: [],
      city: "",
      practiceLocation: "",
    };

    return await newRider.save();
  }

  async updateOne(id: string, rider: Rider) {
    const newRider: Rider = {
      ...rider,
      displayName: `${rider.identity.firstName} ${rider.identity.lastName}`,
      description: rider.description,
      identity: {
        ...rider.identity,
        firstName: rider.identity.firstName,
        lastName: rider.identity.lastName,
        fullName: `${rider.identity.firstName} ${rider.identity.lastName}`,
        birthDate: rider.identity.birthDate,
        city: rider.identity.city,
        country: rider.identity.country,
        gender: rider.identity.gender as GenderIdentity,
        languageSpoken: rider.identity.languageSpoken,
        practiceLocation: rider.identity.practiceLocation,
      } as RiderIdentity,
    };

    return await this._riderModel.findByIdAndUpdate(id, newRider, {
      new: true,
    });
  }

  async compareEncryptedPassword(
    riderId: string,
    password: string,
  ): Promise<boolean> {
    const user = await this._riderModel.findById(riderId).exec();

    return user.compareEncryptedPassword(password);
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

  async remove(id: string): Promise<void> {
    await this._riderModel.findByIdAndDelete(id).exec();
  }
}
