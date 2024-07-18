import { Injectable } from "@nestjs/common";
import { RidersService } from "src/riders/riders.service";
import { SponsorsService } from "src/sponsors/sponsors.service";
import { getLast5Riders, getLast3Sponsors } from "./utils/aggregates";

@Injectable()
export class MarketplaceService {
  constructor(
    private _ridersService: RidersService,
    private _sponsorsService: SponsorsService,
  ) {}

  async getBasicMarketplace(profileType: string) {
    let query;
    if (profileType === "rider") {
      query = this._ridersService.aggregate(getLast5Riders);
    }

    if (profileType === "sponsor") {
      query = this._sponsorsService.aggregate(getLast3Sponsors);
    }

    const result = await query;

    if (!result) {
      return {
        success: false,
        error: "no-data-found",
        message: "No data found",
      };
    }

    return {
      success: true,
      data: result,
    };
  }
}
