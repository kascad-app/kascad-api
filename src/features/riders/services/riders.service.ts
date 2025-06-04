import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
  AccountStatus,
  GenderIdentity,
  ProfileType,
  registerRiderDto,
  Rider,
  RiderIdentity,
  ViewEntry,
} from "@kascad-app/shared-types";

import { RiderDocument, RiderModel } from "../schemas/rider.schema";

import { Model } from "mongoose";
import { Cron } from "@nestjs/schedule";

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
    return await this._riderModel
      .find()
      .select("-_id -__v")
      .where("status.status")
      .equals(AccountStatus.ACTIVE)
      .exec();
  }

  async findById(id: string): Promise<Rider> {
    return await this._riderModel.findById(id);
  }

  async findBySlug(slug: string): Promise<Rider> {
    return await this._riderModel
      .findOne({ "identifier.slug": slug })
      .select("-_id -__v")
      .where("status.status")
      .equals(AccountStatus.ACTIVE)
      .exec();
  }

  async addViewEntry(idUser: string, slug: string) {
    const rider = await this._riderModel.findOne({ "identifier.slug": slug });

    if (!rider) return null;

    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const alreadyVisited = (rider.views?.viewEntries || []).some(
      (entry: ViewEntry) =>
        String(entry.idUser) === String(idUser) &&
        new Date(entry.timestamp) >= startOfWeek,
    );

    if (!alreadyVisited) {
      await this._riderModel.findOneAndUpdate(
        { "identifier.slug": slug },
        {
          $push: {
            "views.viewEntries": {
              idUser,
              timestamp: new Date(),
            },
          },
        },
        { new: true },
      );
    }
  }

  async aggregate(pipeline: any[]): Promise<Rider[]> {
    return await this._riderModel.aggregate(pipeline).exec();
  }

  async generateSlug(firstName: string, lastName: string): Promise<string> {
    const fullName = firstName + "-" + lastName;
    const baseSlug = fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 20);

    const regex = new RegExp(`^${baseSlug}(-\\d+)?$`);
    const existingSlugs = await this._riderModel
      .find({ "identifier.slug": { $regex: regex } })
      .select("identifier.slug")
      .lean();

    const takenSlugs = existingSlugs.map((doc) => doc.identifier.slug);

    if (!takenSlugs.includes(baseSlug)) {
      return baseSlug;
    }

    let maxSuffix = 0;
    takenSlugs.forEach((slug) => {
      const match = slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSuffix) {
          maxSuffix = num;
        }
      }
    });

    return `${baseSlug}-${maxSuffix + 1}`;
  }

  async create(
    registerDto: registerRiderDto,
    slugRider: string,
  ): Promise<Rider> {
    const newRider = new this._riderModel({
      password: registerDto.password,
    });

    newRider.type = ProfileType.RIDER;

    newRider.identifier = {
      email: registerDto.email,
      slug: slugRider,
      strava: { isLinked: false },
    };

    newRider.displayName = `${registerDto.firstName} ${registerDto.lastName}`;

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
    const current = await this._riderModel.findById(id).lean();
    const newRider: Rider = {
      ...rider,
      displayName: `${rider.identity.firstName} ${rider.identity.lastName}`,
      identifier: {
        email: current.identifier.email,
        slug: current.identifier.slug,
        phoneNumber: rider.identifier.phoneNumber,
        username: rider.identifier.username,
        strava: {
          isLinked: current.identifier.strava.isLinked,
          identifier: current.identifier.strava.identifier,
        },
      },
      verified: current.verified,
      password: current.password,
      role: current.role,
      identity: {
        ...rider.identity,
        firstName: rider.identity.firstName,
        lastName: rider.identity.lastName,
        fullName: `${rider.identity.firstName} ${rider.identity.lastName}`,
        birthDate: rider.identity.birthDate,
        gender: rider.identity.gender as GenderIdentity,
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
