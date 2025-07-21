import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { RidersController } from "./controllers/riders.controller";
import { RiderSchema } from "./schemas/rider.schema";
import { RidersCronService } from "./services/rider-cron.service";
import { RidersService } from "./services/riders.service";

import MongoDBConnection from "src/common/constants/mongoDbConnections";
import { MongoDBConfigService } from "src/config/database/mongodb.config";
import { GcpModule } from "src/shared/gcp/gcp.module";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: "Rider",
        schema: RiderSchema,
        collection: MongoDBConnection.RIDERS,
      },
    ]),
    GcpModule,
  ],
  controllers: [RidersController],
  providers: [RidersService, RidersCronService, Logger],
  exports: [RidersService],
})
export class RidersModule {}
