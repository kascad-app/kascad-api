import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ApplicationController } from "./controllers/application.controller";
import { CustomRiderController } from "./controllers/custom-rider.controller";
import { OffersController } from "./controllers/offers.controller";
import { CustomRider, CustomRiderSchema } from "./schemas/custom-rider.schema";
import { Offer, OfferSchema } from "./schemas/offers.schema";
import { ApplicationService } from "./services/application.service";
import { CustomRiderService } from "./services/custom-rider.service";
import { OfferService } from "./services/offers.service";

import MongoDBConnection from "src/common/constants/mongoDbConnections";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Offer.name,
        schema: OfferSchema,
        collection: MongoDBConnection.OFFERS,
      },
      {
        name: CustomRider.name,
        schema: CustomRiderSchema,
        collection: MongoDBConnection.CUSTOM_RIDERS,
      },
    ]),
  ],
  controllers: [OffersController, CustomRiderController, ApplicationController],
  providers: [OfferService, CustomRiderService, ApplicationService, Logger],
  exports: [OfferService, CustomRiderService, ApplicationService],
})
export class OffersModule {}
