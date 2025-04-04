import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { SponsorsController } from "./controllers/sponsors.controller";
import { SponsorSchema } from "./schemas/sponsor.schema";
import { SponsorsService } from "./services/sponsors.service";

import MongoDBConnection from "src/common/constants/mongoDbConnections";
import { MongoDBConfigService } from "src/config/database/mongodb.config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: "Sponsor",
        schema: SponsorSchema,
        collection: MongoDBConnection.SPONSORS,
      },
    ]),
  ],
  controllers: [SponsorsController],
  providers: [SponsorsService],
  exports: [SponsorsService],
})
export class SponsorsModule {}
