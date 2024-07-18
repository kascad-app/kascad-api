import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SponsorDocument } from "./schemas/sponsor.schema";
import { registerSponsorDto, Sponsor } from "@kascad-app/shared-types";

type SponsorSearchParams = {
  [key: string]: string | number | boolean;
};

@Injectable()
export class SponsorsService {
  constructor(
    @InjectModel("Sponsor") private _sponsorModel: Model<SponsorDocument>,
  ) {}

  async search(params?: SponsorSearchParams): Promise<Sponsor[]> {
    let query = {};
    if (params) {
      query = {
        $or: Object.entries(params).map(([key, value]) => ({ [key]: value })),
      };
    }
    const sponsor: Sponsor[] = await this._sponsorModel.find(query);
    return sponsor;
  }

  // Vos méthodes de service ici
  async findAll(): Promise<Sponsor[]> {
    return await this._sponsorModel.find().exec();
  }

  async findById(id: string): Promise<Sponsor> {
    return await this._sponsorModel.findById(id).exec();
  }

  async create(createSponsorDto: registerSponsorDto): Promise<Sponsor> {
    const newSponsor = new this._sponsorModel({
      password: createSponsorDto.password,
      type: createSponsorDto.type,
    });
    newSponsor.identifier = { email: createSponsorDto.email };

    newSponsor.identity = {
      companyName: createSponsorDto.companyName,
      website: "",
      logo: "",
    };

    return await newSponsor.save();
  }

  async aggregate(pipeline: any[]): Promise<Sponsor[]> {
    return await this._sponsorModel.aggregate(pipeline).exec();
  }

  async compareEncryptedPassword(
    sponsorId: string,
    password: string,
  ): Promise<boolean> {
    const sponsor = await this._sponsorModel.findById(sponsorId).exec();

    return sponsor.compareEncryptedPassword(password);
  }

  async update(
    id: string,
    updateSponsorDto: registerSponsorDto,
  ): Promise<Sponsor> {
    const newSponsor = new this._sponsorModel(updateSponsorDto);

    newSponsor.identity = {
      companyName: updateSponsorDto.companyName,
      website: "",
      logo: "",
    };

    return await this._sponsorModel
      .findByIdAndUpdate(id, updateSponsorDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this._sponsorModel.findByIdAndDelete(id).exec();
  }
}
