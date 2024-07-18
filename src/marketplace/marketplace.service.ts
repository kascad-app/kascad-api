import { Injectable } from "@nestjs/common";
import { RidersService } from "src/riders/riders.service";
import { SponsorsService } from "src/sponsors/sponsors.service";

@Injectable()
export class MarketplaceService {
  constructor(
    private _ridersService: RidersService,
    private _sponsorsService: SponsorsService,
  ) {}

  getBasicMarketplace(profileType: string) {
    // let query;
    // if (profileType === "rider") {
    //   query = this._ridersService.findAll().sort({ createdAt: -1 });
    // }
    return `This is the basic marketplace for ${profileType}`;
  }
}
