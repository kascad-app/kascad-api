import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { SavedSearchService } from "../services/saved-search.service";
import {
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from "../types/search.dtos";

import { Logged } from "src/common/decorators/logged.decorator";

@ApiTags("Saved Searches")
@ApiBearerAuth()
@Controller("saved-search")
@Logged()
export class SavedSearchController {
  constructor(private readonly _savedSearchService: SavedSearchService) {}

  @Get(":userId")
  @ApiOperation({
    summary: "Get user saved searches",
    description: "Retrieves all saved searches for a specific user",
  })
  @ApiParam({ name: "userId", type: String, description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "Saved searches retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUserSavedSearches(@Param("userId") userId: string) {
    return this._savedSearchService.getUserSavedSearches(userId);
  }

  @Post()
  @ApiOperation({
    summary: "Create saved search",
    description: "Creates a new saved search for the user",
  })
  @ApiBody({ description: "Saved search creation data" })
  @ApiResponse({
    status: 201,
    description: "Saved search created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createSavedSearch(@Body() body: CreateSavedSearchDto) {
    return this._savedSearchService.create(body);
  }

  @Patch(":userId/:savedSearchId")
  @ApiOperation({
    summary: "Update saved search",
    description: "Updates an existing saved search",
  })
  @ApiParam({ name: "userId", type: String, description: "User ID" })
  @ApiParam({
    name: "savedSearchId",
    type: String,
    description: "Saved search ID",
  })
  @ApiBody({ description: "Saved search update data" })
  @ApiResponse({
    status: 200,
    description: "Saved search updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "Saved search not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async updateSavedSearch(
    @Param("userId") userId: string,
    @Param("savedSearchId") savedSearchId: string,
    @Body() body: UpdateSavedSearchDto,
  ) {
    return this._savedSearchService.update(userId, savedSearchId, body);
  }

  @Delete(":userId/:savedSearchId")
  @ApiOperation({
    summary: "Delete saved search",
    description: "Deletes an existing saved search",
  })
  @ApiParam({ name: "userId", type: String, description: "User ID" })
  @ApiParam({
    name: "savedSearchId",
    type: String,
    description: "Saved search ID",
  })
  @ApiResponse({
    status: 200,
    description: "Saved search deleted successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "Saved search not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async deleteSavedSearch(
    @Param("userId") userId: string,
    @Param("savedSearchId") savedSearchId: string,
  ) {
    return this._savedSearchService.delete(userId, savedSearchId);
  }
}
