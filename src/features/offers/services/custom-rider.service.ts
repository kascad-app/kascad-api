import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { UpdateCustomRiderDto } from "../interfaces/custom-rider.interfaces";
import {
  CustomRider,
  CustomRiderDocument,
} from "../schemas/custom-rider.schema";

import { OfferService } from "./offers.service";

import { Model } from "mongoose";

@Injectable()
export class CustomRiderService {
  constructor(
    @InjectModel(CustomRider.name)
    private customRiderModel: Model<CustomRiderDocument>,
    private readonly offerService: OfferService,
    private readonly logger: Logger,
  ) {}

  private async checkCustomRiderOwnership(
    customRiderId: string,
    verifications: { offerId: string; sponsorId: string },
  ) {
    const customRider = await this.getById(customRiderId);
    const offer = await this.offerService.getOfferById(verifications.offerId);

    if (!customRider) {
      throw new NotFoundException("Custom rider not found");
    }

    if (offer.sponsorId.toString() !== verifications.sponsorId) {
      throw new ForbiddenException("You are not the owner of this offer");
    }

    if (customRider.offerId.toString() !== offer._id.toString()) {
      throw new ForbiddenException("You are not the owner of this offer");
    }

    return customRider;
  }

  async create(riderId: string, offerId: string) {
    const offer = await this.offerService.getOfferById(offerId);

    if (!offer) {
      throw new NotFoundException("Offer not found");
    }

    const customRider = new this.customRiderModel({ riderId, offerId });

    return customRider.save();
  }

  async getById(customRiderId: string): Promise<CustomRiderDocument> {
    const customRider = await this.customRiderModel.findOne({
      _id: customRiderId,
    });
    if (!customRider) {
      throw new NotFoundException(
        `Custom rider with ID ${customRiderId} not found`,
      );
    }
    return customRider;
  }

  async update(
    customRiderId: string,
    verifications: { offerId: string; sponsorId: string },
    updateCustomRiderDto: UpdateCustomRiderDto,
  ): Promise<CustomRiderDocument> {
    try {
      await this.checkCustomRiderOwnership(customRiderId, verifications);

      const updatedCustomRider = await this.customRiderModel
        .findByIdAndUpdate(
          customRiderId,
          {
            ...updateCustomRiderDto,
            updatedAt: new Date(),
          },
          { new: true },
        )
        .populate("riderId", "email identity.firstName identity.lastName")
        .exec();

      if (!updatedCustomRider) {
        throw new NotFoundException("Custom rider not found");
      }

      this.logger.log(`Custom rider updated: ${customRiderId}`);
      return updatedCustomRider;
    } catch (error) {
      this.logger.error(`Error updating custom rider ${customRiderId}:`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error.name === "ValidationError") {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }

      throw new InternalServerErrorException("Failed to update custom rider");
    }
  }
}
