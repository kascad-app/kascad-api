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

  async getBasicMarketplace(profileType: "rider" | "sponsor") {
    const result =
      profileType === "sponsor"
        ? await this.getLastThreeSponsors()
        : await this.getLastFiveRiders();

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

  /**
   *
   *--------------------------------------------------
   * ---------------- PRIVATE METHODS ----------------
   *--------------------------------------------------
   *
   */

  /**
   *
   *   RIDERS
   *
   */
  private async getLastFiveRiders() {
    return this._ridersService.aggregate(getLast5Riders);
  }
  /**
   *
   *   SPONSOR
   *
   */

  private async getLastThreeSponsors() {
    return this._sponsorsService.aggregate(getLast3Sponsors);
  }
}
