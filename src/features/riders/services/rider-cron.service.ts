import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";

import { RiderModel } from "../schemas/rider.schema";

@Injectable()
export class RidersCronService {
  constructor(@InjectModel("Rider") private readonly _riderModel: RiderModel) {}

  @Cron("1 0 1 * *")
  async handleMonthlyViews() {
    await this._riderModel.archiveAndClearMonthlyViews();
  }
}
