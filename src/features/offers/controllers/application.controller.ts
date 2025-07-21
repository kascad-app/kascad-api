import { Controller, Param, Put } from "@nestjs/common";

import { Sponsor } from "@kascad-app/shared-types";

import { ApplicationService } from "../services/application.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";

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
}
