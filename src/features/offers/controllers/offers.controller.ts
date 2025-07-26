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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

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

@ApiTags("Offers")
@ApiBearerAuth()
@Controller()
@Logged()
export class OffersController {
  constructor(
    private readonly offerService: OfferService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create a new offer",
    description: "Creates a new job offer for sponsors",
  })
  @ApiBody({ description: "Offer creation data" })
  @ApiResponse({ status: 201, description: "Offer created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Get offers for riders",
    description:
      "Retrieves paginated list of offers with alreadyApplied flag for the authenticated rider",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10)",
  })
  @ApiQuery({
    name: "status",
    required: false,
    type: String,
    description: "Filter by offer status",
  })
  @ApiQuery({
    name: "sport",
    required: false,
    type: String,
    description: "Filter by sport",
  })
  @ApiQuery({
    name: "contractType",
    required: false,
    type: String,
    description: "Filter by contract type",
  })
  @ApiResponse({
    status: 200,
    description: "List of offers retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token or not a rider",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Get offer statistics",
    description: "Retrieves statistics for sponsor offers",
  })
  @ApiResponse({
    status: 200,
    description: "Offer statistics retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Get offers dashboard",
    description: "Retrieves paginated list of sponsor own offers for dashboard",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10)",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard offers retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token or not a sponsor",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Get offer by ID",
    description:
      "Retrieves a specific offer by ID for the authenticated sponsor",
  })
  @ApiParam({ name: "id", type: String, description: "Offer ID" })
  @ApiResponse({ status: 200, description: "Offer retrieved successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Not owner of the offer",
  })
  @ApiResponse({ status: 404, description: "Offer not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Update offer",
    description: "Updates an existing offer for the authenticated sponsor",
  })
  @ApiParam({ name: "id", type: String, description: "Offer ID" })
  @ApiBody({ description: "Offer update data" })
  @ApiResponse({ status: 200, description: "Offer updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Not owner of the offer",
  })
  @ApiResponse({ status: 404, description: "Offer not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Delete offer",
    description: "Soft deletes an offer for the authenticated sponsor",
  })
  @ApiParam({ name: "id", type: String, description: "Offer ID" })
  @ApiResponse({ status: 200, description: "Offer deleted successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Not owner of the offer",
  })
  @ApiResponse({ status: 404, description: "Offer not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
