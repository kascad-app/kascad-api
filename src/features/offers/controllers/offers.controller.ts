import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import {
  CreateOfferDto,
  GetOffersQueryDto,
  OfferParamsDto,
  UpdateOfferDto,
} from "../interfaces/offer.interfaces";
import { OfferService } from "../services/offers.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";
import { Sponsor } from "src/features/sponsors/schemas/sponsor.schema";

@Controller()
@Logged()
export class OffersController {
  constructor(
    private readonly offerService: OfferService,
    private readonly logger: Logger,
  ) {}

  @Post()
  async createOffer(
    @Body(new ZodValidationPipe(CreateOfferDto)) createOfferDto: CreateOfferDto,
    @User() user: Sponsor,
  ) {
    const sponsorId = user._id.toString();

    try {
      const offer = await this.offerService.createOffer(
        sponsorId,
        createOfferDto,
      );
      return offer;
    } catch (error) {
      this.logger.error("Error creating offer:", error);
      throw error;
    }
  }

  @Get()
  async getOffers(
    @Query(new ZodValidationPipe(GetOffersQueryDto)) query: GetOffersQueryDto,
    @User() user: Sponsor,
  ) {
    const sponsorId = user._id.toString();

    try {
      const result = await this.offerService.getOffers(sponsorId, query);
      return {
        data: result.offers,
        pagination: {
          currentPage: query.page,
          totalPages: Math.ceil(result.total / query.limit),
          totalItems: result.total,
          itemsPerPage: query.limit,
        },
      };
    } catch (error) {
      this.logger.error("Error getting offers:", error);
      throw error;
    }
  }

  @Get("stats")
  async getOfferStats(@User() user: Sponsor) {
    const sponsorId = user._id.toString();

    try {
      const stats = await this.offerService.getOfferStats(sponsorId);

      return stats;
    } catch (error) {
      this.logger.error("Error getting offer stats:", error);
      throw error;
    }
  }

  @Get(":id")
  async getOfferById(
    @Param(new ZodValidationPipe(OfferParamsDto)) params: OfferParamsDto,
    @User() user: Sponsor,
  ) {
    const sponsorId = user._id.toString();

    try {
      const offer = await this.offerService.getOfferById(params.id, sponsorId);
      return offer;
    } catch (error) {
      this.logger.error(`Error getting offer ${params.id}:`, error);
      throw error;
    }
  }

  @Put(":id")
  async updateOffer(
    @Param(new ZodValidationPipe(OfferParamsDto)) params: OfferParamsDto,
    @Body(new ZodValidationPipe(UpdateOfferDto)) updateOfferDto: UpdateOfferDto,
    @User() user: Sponsor,
  ) {
    const sponsorId = user._id.toString();

    try {
      const offer = await this.offerService.updateOffer(
        params.id,
        sponsorId,
        updateOfferDto,
      );
      return offer;
    } catch (error) {
      this.logger.error(`Error updating offer ${params.id}:`, error);
      throw error;
    }
  }

  @Delete(":id")
  async softDeleteOffer(
    @Param(new ZodValidationPipe(OfferParamsDto)) params: OfferParamsDto,
    @User() user: Sponsor,
  ) {
    const sponsorId = user._id.toString();

    try {
      const offer = await this.offerService.softDeleteOffer(
        params.id,
        sponsorId,
      );
      return offer;
    } catch (error) {
      this.logger.error(`Error deleting offer ${params.id}:`, error);
      throw error;
    }
  }
}
