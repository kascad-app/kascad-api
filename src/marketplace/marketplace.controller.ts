import { Controller, Get, Param } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";

@Controller("marketplace")
export class MarketplaceController {
  constructor(private _marketplaceService: MarketplaceService) {}

  @Get(":profileType")
  async getBasicMarketplace(@Param("profileType") profileType: string) {
    return this._marketplaceService.getBasicMarketplace(profileType);
  }
}
