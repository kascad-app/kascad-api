import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { ProfileType, Rider, Sponsor } from "@kascad-app/shared-types";

import {
  ApplicationsResponse,
  GetApplicationsQueryDto,
} from "../interfaces/custom-rider.interfaces";
import { ApplicationService } from "../services/application.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";

@ApiTags('Applications')
@ApiBearerAuth()
@Controller("application")
@Logged()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Put("accept/:offerId/:riderId")
  @ApiOperation({ summary: 'Accept rider application', description: 'Accepts a rider application for an offer (sponsor only)' })
  @ApiParam({ name: 'offerId', type: String, description: 'Offer ID' })
  @ApiParam({ name: 'riderId', type: String, description: 'Rider ID' })
  @ApiResponse({ status: 200, description: 'Application accepted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner of the offer' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async accept(
    @User() user: Sponsor,
    @Param("offerId") offerId: string,
    @Param("riderId") riderId: string,
  ) {
    return this.applicationService.accept(riderId, offerId, user._id);
  }

  @Put("reject/:offerId/:riderId")
  @ApiOperation({ summary: 'Reject rider application', description: 'Rejects a rider application for an offer (sponsor only)' })
  @ApiParam({ name: 'offerId', type: String, description: 'Offer ID' })
  @ApiParam({ name: 'riderId', type: String, description: 'Rider ID' })
  @ApiResponse({ status: 200, description: 'Application rejected successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner of the offer' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async reject(
    @User() user: Sponsor,
    @Param("offerId") offerId: string,
    @Param("riderId") riderId: string,
  ) {
    return this.applicationService.reject(riderId, offerId, user._id);
  }

  @Get()
  @ApiOperation({ summary: 'Get rider applications', description: 'Retrieves paginated list of applications for the authenticated rider' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Not a rider account' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getApplications(
    @User() user: Rider,
    @Query(new ZodValidationPipe(GetApplicationsQueryDto))
    query: GetApplicationsQueryDto,
  ): Promise<ApplicationsResponse> {
    if (user.type !== ProfileType.RIDER) {
      throw new BadRequestException("Access denied: Riders only");
    }

    const result = await this.applicationService.getRiderApplications(
      user._id,
      query.page,
      query.limit,
    );

    return {
      applications: result.applications,
      pagination: {
        currentPage: query.page,
        totalPages: Math.ceil(result.total / query.limit),
        totalItems: result.total,
        itemsPerPage: query.limit,
      },
    };
  }
}
