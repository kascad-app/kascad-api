import { Module } from "@nestjs/common";
import { RidersController } from "./riders.controller";
import { RidersService } from "./riders.service";
import { RiderSchema } from "./schemas/rider.schema";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoDBConfigService } from "src/config/database/mongodb.config";
import MongoDBConnection from "src/common/constants/mongoDbConnections";

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
  ],
  controllers: [RidersController],
  providers: [RidersService],
  exports: [RidersService],
})
export class RidersModule {}
