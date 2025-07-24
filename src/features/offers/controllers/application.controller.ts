import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Put,
  Query,
} from "@nestjs/common";

import { ProfileType, Rider, Sponsor } from "@kascad-app/shared-types";

import {
  ApplicationsResponse,
  GetApplicationsQueryDto,
} from "../interfaces/custom-rider.interfaces";
import { ApplicationService } from "../services/application.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { ZodValidationPipe } from "src/common/pipes/zod-validator.pipe";

@Controller("application")
@Logged()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Put("accept/:offerId/:riderId")
  async accept(
    @User() user: Sponsor,
    @Param("offerId") offerId: string,
    @Param("riderId") riderId: string,
  ) {
    return this.applicationService.accept(riderId, offerId, user._id);
  }

  @Put("reject/:offerId/:riderId")
  async reject(
    @User() user: Sponsor,
    @Param("offerId") offerId: string,
    @Param("riderId") riderId: string,
  ) {
    return this.applicationService.reject(riderId, offerId, user._id);
  }

  @Get()
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
