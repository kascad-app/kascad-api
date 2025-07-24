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
  UnauthorizedException,
} from "@nestjs/common";

import { ProfileType, Rider } from "@kascad-app/shared-types";

import {
  CreateOfferDto,
  GetOffersDashboardQueryDto,
  GetOffersQueryDto,
  OfferParamsDto,
  OffersDashboardResponse,
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
      const offer = await this.offerService.create(sponsorId, createOfferDto);
      return offer;
    } catch (error) {
      this.logger.error("Error creating offer:", error);
      throw error;
    }
  }

  @Get()
  async getOffers(
    @Query(new ZodValidationPipe(GetOffersQueryDto)) query: GetOffersQueryDto,
    @User() user: Rider,
  ) {
    if (user.type !== ProfileType.RIDER) {
      throw new UnauthorizedException("Unauthorized");
    }

    try {
      const result = await this.offerService.getOffers(query, user._id);
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

  @Get("dashboard")
  async getOffersDashboard(
    @User() user: Sponsor,
    @Query(new ZodValidationPipe(GetOffersDashboardQueryDto))
    query: GetOffersDashboardQueryDto,
  ): Promise<OffersDashboardResponse> {
    if (user.type !== ProfileType.SPONSOR)
      throw new UnauthorizedException("Unauthorized");

    const sponsorId = user._id.toString();

    try {
      const result = await this.offerService.getOffersDashboard(
        sponsorId,
        query.page,
        query.limit,
      );
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
      this.logger.error("Error getting offers dashboard:", error);
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
      const offer = await this.offerService.getOfferByIdAndSponsorId(
        params.id,
        sponsorId,
      );
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
      const offer = await this.offerService.update(
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
      const offer = await this.offerService.softDelete(params.id, sponsorId);
      return offer;
    } catch (error) {
      this.logger.error(`Error deleting offer ${params.id}:`, error);
      throw error;
    }
  }
}
