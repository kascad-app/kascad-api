import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";

import { RiderSearchFilters } from "../aggregates/get-search-pipeline";
import { SearchService } from "../services/search.service";
import {
  validateAdvancedSearch,
  validateQuickSearch,
} from "../types/search.dtos";

import { Logged } from "src/common/decorators/logged.decorator";

@ApiTags('Search')
@ApiBearerAuth()
@Controller("search")
@Logged()
export class SearchController {
  constructor(private readonly _searchService: SearchService) {}

  @Post("riders")
  @ApiOperation({ summary: 'Advanced rider search', description: 'Performs advanced search for riders with detailed filters' })
  @ApiBody({ description: 'Advanced search filters' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Quick rider search', description: 'Performs quick search for riders with basic filters' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'sport', required: false, type: String, description: 'Sport filter' })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Location filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Quick search results retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Get rider search count', description: 'Returns the total count of riders matching search criteria' })
  @ApiQuery({ name: 'sport', required: false, type: String, description: 'Sport filter' })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Location filter' })
  @ApiQuery({ name: 'ageMin', required: false, type: Number, description: 'Minimum age' })
  @ApiQuery({ name: 'ageMax', required: false, type: Number, description: 'Maximum age' })
  @ApiResponse({ status: 200, description: 'Search count retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
