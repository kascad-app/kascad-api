import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { SavedSearchService } from "../services/saved-search.service";
import {
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from "../types/search.dtos";

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
    return this._savedSearchService.create(body);
  }

  @Patch(":userId/:savedSearchId")
  async updateSavedSearch(
    @Param("userId") userId: string,
    @Param("savedSearchId") savedSearchId: string,
    @Body() body: UpdateSavedSearchDto,
  ) {
    return this._savedSearchService.update(userId, savedSearchId, body);
  }

  @Delete(":userId/:savedSearchId")
  async deleteSavedSearch(
    @Param("userId") userId: string,
    @Param("savedSearchId") savedSearchId: string,
  ) {
    return this._savedSearchService.delete(userId, savedSearchId);
  }
}
