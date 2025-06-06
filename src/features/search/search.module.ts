import { Module } from "@nestjs/common";

import { RidersModule } from "../riders/riders.module";

import { SearchController } from "./controllers/search.controller";
import { SearchService } from "./services/search.service";

@Module({
  imports: [RidersModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [],
})
export class SearchModule {}
