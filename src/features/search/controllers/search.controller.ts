import { Body, Controller, Post } from "@nestjs/common";

import { SearchService } from "../services/search.service";

import { Logged } from "src/common/decorators/logged.decorator";

type SearchSearchDto = {
  [key: string]: string | number | boolean;
};

@Controller()
@Logged()
export class SearchController {
  constructor(private readonly _searchService: SearchService) {}

  @Post("search")
  async search(@Body() searchSearchDto: SearchSearchDto) {
    return this._searchService.search(searchSearchDto);
  }
}
