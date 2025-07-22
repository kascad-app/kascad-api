import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { ProfileType, Rider, Sponsor } from "@kascad-app/shared-types";

import {
  CustomRiderParamsDto,
  GetCustomRidersQueryDto,
  UpdateCustomRiderDto,
} from "../interfaces/custom-rider.interfaces";
import { CustomRiderService } from "../services/custom-rider.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";

@Controller("custom-rider")
@Logged()
export class CustomRiderController {
  constructor(
    private readonly customRiderService: CustomRiderService,
    private readonly logger: Logger,
  ) {}

  @Post("/:offerId")
  async createCustomRider(
    @User() user: Rider,
    @Param("offerId") offerId: string,
  ) {
    if (user.type !== ProfileType.RIDER) {
      throw new BadRequestException("User is not a custom rider");
    }

    return this.customRiderService.create(user._id, offerId);
  }

  @Get()
  async getCustomRiders(
    @Query(new ZodValidationPipe(GetCustomRidersQueryDto))
    query: GetCustomRidersQueryDto,
    @User() user: Sponsor,
  ) {
    if (user.type !== ProfileType.SPONSOR) {
      throw new BadRequestException("Access denied: Sponsors only");
    }

    const sponsorId = user._id.toString();

    try {
      const result = await this.customRiderService.getAll(sponsorId, query);
      return {
        data: result.customRiders,
        pagination: {
          currentPage: query.page,
          totalPages: Math.ceil(result.total / query.limit),
          totalItems: result.total,
          itemsPerPage: query.limit,
        },
      };
    } catch (error) {
      this.logger.error("Error getting custom riders:", error);
      throw error;
    }
  }

  @Get(":id")
  async getCustomRiderById(
    @Param(new ZodValidationPipe(CustomRiderParamsDto))
    params: CustomRiderParamsDto,
    @User() user: Sponsor,
  ) {
    if (user.type !== ProfileType.SPONSOR) {
      throw new BadRequestException("Access denied: Sponsors only");
    }

    const sponsorId = user._id.toString();

    try {
      const customRider = await this.customRiderService.getById(
        params.id,
        sponsorId,
      );
      return customRider;
    } catch (error) {
      this.logger.error(`Error getting custom rider ${params.id}:`, error);
      throw error;
    }
  }

  @Put("/:offerId/:id")
  async updateCustomRider(
    @Param("offerId") offerId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateCustomRiderDto))
    updateCustomRiderDto: UpdateCustomRiderDto,
    @User() user: Sponsor,
  ) {
    if (user.type !== ProfileType.SPONSOR) {
      throw new BadRequestException("Access denied: Sponsors only");
    }

    const sponsorId = user._id.toString();

    try {
      const customRider = await this.customRiderService.update(
        id,
        { offerId, sponsorId },
        updateCustomRiderDto,
      );
      return customRider;
    } catch (error) {
      this.logger.error(`Error updating custom rider ${id}:`, error);
      throw error;
    }
  }
}
