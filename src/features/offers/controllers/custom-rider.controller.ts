import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";

import { ProfileType, Rider, Sponsor } from "@kascad-app/shared-types";

import { UpdateCustomRiderDto } from "../interfaces/custom-rider.interfaces";
import { CustomRiderService } from "../services/custom-rider.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";

@ApiTags('Custom Riders')
@ApiBearerAuth()
@Controller("custom-rider")
@Logged()
export class CustomRiderController {
  constructor(
    private readonly customRiderService: CustomRiderService,
    private readonly logger: Logger,
  ) {}

  @Post("/:offerId")
  @ApiOperation({ summary: 'Apply to offer', description: 'Creates a custom rider application for an offer' })
  @ApiParam({ name: 'offerId', type: String, description: 'Offer ID' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or user is not a rider' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Update rider application', description: 'Updates a custom rider application status (sponsor only)' })
  @ApiParam({ name: 'offerId', type: String, description: 'Offer ID' })
  @ApiParam({ name: 'id', type: String, description: 'Custom rider ID' })
  @ApiBody({ description: 'Custom rider update data' })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or user is not a sponsor' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
