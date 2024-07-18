import { Controller, Get, Param } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { BadRequest } from "src/common/exceptions/bad-request.exception";
import { Logged } from "src/common/decorators/logged.decorator";

@Controller("marketplace")
export class MarketplaceController {
  constructor(private _marketplaceService: MarketplaceService) {}

  @Logged()
  @Get("/basic/:profileType")
  async getBasicMarketplace(
    @Param("profileType") profileType: "rider" | "sponsor",
  ) {
    if (profileType !== "rider" && profileType !== "sponsor") return BadRequest;

    return this._marketplaceService.getBasicMarketplace(profileType);
  }
}
