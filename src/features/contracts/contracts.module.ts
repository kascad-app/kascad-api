import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import MongoDBConnection from "src/common/constants/mongoDbConnections";
import { MongoDBConfigService } from "src/config/database/mongodb.config";
import { ContractOfferSchema } from "./schemas/contract.schema";
import { ContractsOffersService } from "./services/contracts.service";
import { ContractsOffersController } from "./controllers/contracts.controller";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: "ContractOffer",
        schema: ContractOfferSchema,
        collection: MongoDBConnection.CONTRACTS,
      },
    ]),
  ],
  controllers: [ContractsOffersController],
  providers: [ContractsOffersService],
  exports: [ContractsOffersService],
})
export class ContractOfferModule {}
