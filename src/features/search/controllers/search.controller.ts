import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from "@nestjs/common";

import { RiderSearchFilters } from "../aggregates/get-search-pipeline";
import { SearchService } from "../services/search.service";
import {
  validateAdvancedSearch,
  validateQuickSearch,
} from "../types/search.dtos";

import { Logged } from "src/common/decorators/logged.decorator";

@Controller("search")
@Logged()
export class SearchController {
  constructor(private readonly _searchService: SearchService) {}

  @Post("riders")
  async searchRiders(@Body() body: unknown) {
    const validation = validateAdvancedSearch(body);

    if (!validation.success) {
      throw new BadRequestException({
        message: "Invalid search data",
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const filters: RiderSearchFilters = validation.data;
    return this._searchService.search(filters);
  }

  @Get("riders/quick")
  async quickSearchRiders(@Query() query: unknown) {
    const validation = validateQuickSearch(query);

    if (!validation.success) {
      throw new BadRequestException({
        message: "Invalid quick search data",
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const filters: RiderSearchFilters = validation.data;
    return this._searchService.search(filters);
  }

  @Get("riders/count")
  async getRiderSearchCount(@Query() query: Record<string, any>) {
    const queryWithDefaults = {
      ...query,
      page: 1,
      limit: 1,
    };

    const validation = validateAdvancedSearch(queryWithDefaults);

    if (!validation.success) {
      throw new BadRequestException({
        message: "Invalid search data",
        errors: validation.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const filters: RiderSearchFilters = validation.data;
    const count = await this._searchService.getSearchCount(filters);

    return {
      count,
      filters: filters,
    };
  }
}
