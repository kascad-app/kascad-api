import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { ProfileType, Rider, Sponsor } from "@kascad-app/shared-types";

import { UpdateCustomRiderDto } from "../interfaces/custom-rider.interfaces";
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
