import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { OfferStatus } from "@kascad-app/shared-types";

import {
  CreateOfferDto,
  GetOffersQueryDto,
  UpdateOfferDto,
} from "../interfaces/offer.interfaces";
import { getOfferWithCustomRidersPipeline } from "../pipelines/offer-with-custom-riders.pipeline";
import { Offer } from "../schemas/offers.schema";

import { Model, Schema as MongooseSchema } from "mongoose";

export type OfferDocument = Offer & Document;

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name)
    private offerModel: Model<OfferDocument>,
    private readonly logger: Logger,
  ) {}

  async create(
    sponsorId: string,
    createOfferDto: CreateOfferDto,
  ): Promise<OfferDocument> {
    try {
      if (
        createOfferDto.budgetMin &&
        createOfferDto.budgetMax &&
        createOfferDto.budgetMin > createOfferDto.budgetMax
      ) {
        throw new BadRequestException(
          "Budget minimum cannot be greater than maximum",
        );
      }

      const newOffer = new this.offerModel({
        ...createOfferDto,
        sponsorId,
        status: OfferStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedOffer = await newOffer.save();
      this.logger.log(`Offer created: ${savedOffer._id}`);
      return savedOffer;
    } catch (error) {
      this.logger.error("Error creating offer:", error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error.name === "ValidationError") {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }

      if (error.code === 11000) {
        throw new ConflictException(
          "An offer with these details already exists",
        );
      }

      throw new InternalServerErrorException("Failed to create offer");
    }
  }

  async getOffers(
    sponsorId: string,
    query: GetOffersQueryDto,
  ): Promise<{ offers: OfferDocument[]; total: number }> {
    try {
      if (!sponsorId) {
        throw new BadRequestException("Sponsor ID is required");
      }

      const { page, limit, status, sport, contractType } = query;
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = {
        sponsorId,
        status: { $ne: OfferStatus.DELETED },
      };

      if (status) {
        filter.status = status;
      }
      if (sport) {
        filter.sports = { $in: [sport] };
      }
      if (contractType) {
        filter.contractType = contractType;
      }

      const [offers, total] = await Promise.all([
        this.offerModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.offerModel.countDocuments(filter).exec(),
      ]);

      return { offers, total };
    } catch (error) {
      this.logger.error("Error getting offers:", error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to retrieve offers");
    }
  }

  async getOfferById(offerId: string): Promise<OfferDocument> {
    try {
      const offer = await this.offerModel
        .findOne({
          _id: offerId,
          status: { $ne: OfferStatus.DELETED },
        })
        .exec();

      if (!offer) {
        throw new NotFoundException("Offer not found");
      }

      return offer;
    } catch (error) {
      this.logger.error(`Error getting offer ${offerId}:`, error);
      throw error;
    }
  }

  async getOfferByIdAndSponsorId(
    offerId: string,
    sponsorId: string,
  ): Promise<any> {
    try {
      const pipeline = getOfferWithCustomRidersPipeline(offerId, sponsorId);
      const result = await this.offerModel.aggregate(pipeline).exec();

      if (!result || result.length === 0) {
        throw new NotFoundException("Offer not found or access denied");
      }

      return result[0];
    } catch (error) {
      this.logger.error(
        `Error getting offer with custom riders ${offerId}:`,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Failed to retrieve offer with custom riders",
      );
    }
  }

  async update(
    offerId: string,
    sponsorId: string,
    updateOfferDto: UpdateOfferDto,
  ): Promise<OfferDocument> {
    try {
      if (
        updateOfferDto.budgetMin &&
        updateOfferDto.budgetMax &&
        updateOfferDto.budgetMin > updateOfferDto.budgetMax
      ) {
        throw new BadRequestException(
          "Budget minimum cannot be greater than maximum",
        );
      }

      const existingOffer = await this.offerModel
        .findOne({
          _id: offerId,
          sponsorId,
          status: { $ne: OfferStatus.DELETED },
        })
        .exec();

      if (!existingOffer) {
        throw new NotFoundException(
          "Offer not found or you don't have permission to update it",
        );
      }

      if (
        updateOfferDto.status &&
        existingOffer.status === OfferStatus.CLOSED
      ) {
        throw new BadRequestException("Cannot modify a closed offer");
      }

      const updatedOffer = await this.offerModel
        .findOneAndUpdate(
          {
            _id: offerId,
            sponsorId,
            status: { $ne: OfferStatus.DELETED },
          },
          {
            ...updateOfferDto,
            updatedAt: new Date(),
          },
          { new: true },
        )
        .exec();

      this.logger.log(`Offer updated: ${offerId}`);
      return updatedOffer!;
    } catch (error) {
      this.logger.error(`Error updating offer ${offerId}:`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (error.name === "ValidationError") {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }

      throw new InternalServerErrorException("Failed to update offer");
    }
  }

  async softDelete(offerId: string, sponsorId: string): Promise<OfferDocument> {
    try {
      const deletedOffer = await this.offerModel
        .findOneAndUpdate(
          {
            _id: offerId,
            sponsorId,
            status: { $ne: OfferStatus.DELETED },
          },
          {
            status: OfferStatus.DELETED,
            updatedAt: new Date(),
          },
          { new: true },
        )
        .exec();

      if (!deletedOffer) {
        throw new NotFoundException("Offer not found");
      }

      this.logger.log(`Offer soft deleted: ${offerId}`);
      return deletedOffer;
    } catch (error) {
      this.logger.error(`Error soft deleting offer ${offerId}:`, error);
      throw error;
    }
  }

  async getOfferStats(sponsorId: string): Promise<{
    total: number;
    draft: number;
    active: number;
    paused: number;
    expired: number;
    closed: number;
  }> {
    try {
      const pipeline = [
        {
          $match: {
            sponsorId: new MongooseSchema.Types.ObjectId(sponsorId),
            status: { $ne: OfferStatus.DELETED },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ];

      const results = await this.offerModel.aggregate(pipeline).exec();

      const stats = {
        total: 0,
        draft: 0,
        active: 0,
        paused: 0,
        expired: 0,
        closed: 0,
      };

      results.forEach((result) => {
        stats[result._id as keyof typeof stats] = result.count;
        stats.total += result.count;
      });

      return stats;
    } catch (error) {
      this.logger.error("Error getting offer stats:", error);
      throw error;
    }
  }
}
