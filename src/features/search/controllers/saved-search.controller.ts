import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { SavedSearchService } from "../services/saved-search.service";
import { CreateSavedSearchDto } from "../types/search.dtos";

import { Logged } from "src/common/decorators/logged.decorator";

@Controller("saved-search")
@Logged()
export class SavedSearchController {
  constructor(private readonly _savedSearchService: SavedSearchService) {}

  @Get(":userId")
  async getUserSavedSearches(@Param("userId") userId: string) {
    return this._savedSearchService.getUserSavedSearches(userId);
  }

  @Post()
  async createSavedSearch(@Body() body: CreateSavedSearchDto) {
    return this._savedSearchService.createSavedSearch(body);
  }
}
