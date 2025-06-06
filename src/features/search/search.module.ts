import { Module } from "@nestjs/common";

import { SearchController } from "./controllers/search.controller";

@Module({
  imports: [],
  controllers: [SearchController],
  providers: [],
  exports: [],
})
export class SearchModule {}
