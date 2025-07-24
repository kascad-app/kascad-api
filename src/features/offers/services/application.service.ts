import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { ApplicationStatus, OfferStatus } from "@kascad-app/shared-types";

import { getRiderApplicationsPipeline } from "../pipelines/get-rider-applications.pipeline";
import {
  CustomRider,
  CustomRiderDocument,
} from "../schemas/custom-rider.schema";

import { OfferService } from "./offers.service";

import { Model } from "mongoose";

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(CustomRider.name)
    private customRiderModel: Model<CustomRiderDocument>,
    private readonly offerService: OfferService,
  ) {}

  async accept(riderId: string, offerId: string, sponsorId: string) {
    const offer = await this.checkIfSponsorIsOwner(sponsorId, offerId);

    if (offer.status !== OfferStatus.ACTIVE) {
      throw new BadRequestException("Offer is not active anymore");
    }

    const customRider = await this.customRiderModel.findOneAndUpdate(
      { riderId, offerId },
      { application: ApplicationStatus.ACCEPTED },
      { new: true },
    );

    if (!customRider) {
      throw new NotFoundException("Custom rider not found");
    }

    return customRider;
  }

  async reject(riderId: string, offerId: string, sponsorId: string) {
    const offer = await this.checkIfSponsorIsOwner(sponsorId, offerId);

    if (offer.status !== OfferStatus.ACTIVE) {
      throw new BadRequestException("Offer is not active anymore");
    }

    const customRider = await this.customRiderModel.findOneAndUpdate(
      { riderId, offerId },
      { application: ApplicationStatus.REJECTED },
      { new: true },
    );

    if (!customRider) {
      throw new NotFoundException("Custom rider not found");
    }

    return customRider;
  }

  async getRiderApplications(
    riderId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ applications: any[]; total: number }> {
    const pipeline = getRiderApplicationsPipeline(riderId, page, limit);
    const result = await this.customRiderModel.aggregate(pipeline).exec();

    if (!result || result.length === 0) {
      return { applications: [], total: 0 };
    }

    const { applications, total } = result[0];
    return { applications, total };
  }

  private async checkIfSponsorIsOwner(sponsorId: string, offerId: string) {
    const offer = await this.offerService.getOfferById(offerId);

    if (!offer) {
      throw new NotFoundException("Offer not found");
    }

    if (offer.sponsorId.toString() !== sponsorId) {
      throw new ForbiddenException("You are not the owner of this offer");
    }

    return offer;
  }
}
