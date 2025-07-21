import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { OffersController } from "./controllers/offers.controller";
import { Offer, OfferSchema } from "./schemas/offers.schema";
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
    ]),
  ],
  controllers: [OffersController],
  providers: [OfferService, Logger],
  exports: [OfferService],
})
export class OffersModule {}
