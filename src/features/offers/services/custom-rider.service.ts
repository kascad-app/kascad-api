import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
  GetCustomRidersQueryDto,
  UpdateCustomRiderDto,
} from "../interfaces/custom-rider.interfaces";
import {
  getCustomRiderByIdPipeline,
  getCustomRidersCountPipeline,
  getCustomRidersPipeline,
} from "../pipelines/custom-rider.pipeline";
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

  async create(riderId: string, offerId: string) {
    const offer = await this.offerService.getOfferById(offerId);

    if (!offer) {
      throw new NotFoundException("Offer not found");
    }

    const customRider = new this.customRiderModel({ riderId, offerId });

    return customRider.save();
  }

  async getAll(
    sponsorId: string,
    query: GetCustomRidersQueryDto,
  ): Promise<{ customRiders: any[]; total: number }> {
    try {
      const { offerId } = query;

      let offerIds: string[];

      if (offerId) {
        const offer = await this.offerService.getOfferByIdAndSponsorId(
          offerId,
          sponsorId,
        );
        if (!offer) {
          throw new NotFoundException("Offer not found or access denied");
        }
        offerIds = [offerId];
      } else {
        const sponsorOffers = await this.offerService.getOffers(sponsorId, {
          page: 1,
          limit: 1000,
        });
        offerIds = sponsorOffers.offers.map((offer) => offer._id.toString());
      }

      if (offerIds.length === 0) {
        return { customRiders: [], total: 0 };
      }

      const pipeline = getCustomRidersPipeline(offerIds, query);
      const countPipeline = getCustomRidersCountPipeline(
        offerIds,
        query.application,
      );

      const [customRiders, totalResult] = await Promise.all([
        this.customRiderModel.aggregate(pipeline).exec(),
        this.customRiderModel.aggregate(countPipeline).exec(),
      ]);

      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      return { customRiders, total };
    } catch (error) {
      this.logger.error("Error getting custom riders:", error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Failed to retrieve custom riders",
      );
    }
  }

  async getById(customRiderId: string, _sponsorId: string): Promise<any> {
    try {
      const pipeline = getCustomRiderByIdPipeline(customRiderId);
      const result = await this.customRiderModel.aggregate(pipeline).exec();

      if (!result || result.length === 0) {
        throw new NotFoundException("Custom rider not found or access denied");
      }

      return result[0];
    } catch (error) {
      this.logger.error(`Error getting custom rider ${customRiderId}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to retrieve custom rider");
    }
  }

  async update(
    customRiderId: string,
    sponsorId: string,
    updateCustomRiderDto: UpdateCustomRiderDto,
  ): Promise<CustomRiderDocument> {
    try {
      await this.getById(customRiderId, sponsorId);

      const updatedCustomRider = await this.customRiderModel
        .findByIdAndUpdate(
          customRiderId,
          {
            ...updateCustomRiderDto,
            updatedAt: new Date(),
          },
          { new: true },
        )
        .populate(
          "riderId",
          "firstName lastName email identity.firstName identity.lastName",
        )
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
