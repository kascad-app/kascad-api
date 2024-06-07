import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sponsor, SponsorDocument } from './schemas/sponsor.schema';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectModel('Sponsor') private sponsorModel: Model<SponsorDocument>,
  ) {}

  // Vos méthodes de service ici
  async findAll(): Promise<Sponsor[]> {
    return this.sponsorModel.find().exec();
  }

  async findOne(id: string): Promise<Sponsor> {
    return this.sponsorModel.findById(id).exec();
  }

  async create(createSponsorDto): Promise<Sponsor> {
    const newSponsor = new this.sponsorModel(createSponsorDto);
    return newSponsor.save();
  }

  async update(id: string, updateSponsorDto): Promise<Sponsor> {
    return this.sponsorModel
      .findByIdAndUpdate(id, updateSponsorDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.sponsorModel.findByIdAndDelete(id).exec();
  }
}
