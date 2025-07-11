import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { RidersModule } from "../riders/riders.module";

import { SavedSearchController } from "./controllers/saved-search.controller";
import { SearchController } from "./controllers/search.controller";
import { SavedSearchSchema } from "./schemas/saved-search.schema";
import { SavedSearchService } from "./services/saved-search.service";
import { SearchService } from "./services/search.service";

import MongoDBConnection from "src/common/constants/mongoDbConnections";
import { MongoDBConfigService } from "src/config/database/mongodb.config";

@Module({
  imports: [
    RidersModule,

    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: "SavedSearch",
        schema: SavedSearchSchema,
        collection: MongoDBConnection.SAVED_SEARCHES,
      },
    ]),
  ],

  controllers: [SearchController, SavedSearchController],
  providers: [SearchService, SavedSearchService],
  exports: [],
})
export class SearchModule {}
