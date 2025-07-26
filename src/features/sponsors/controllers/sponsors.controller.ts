import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { registerSponsorDto, Sponsor } from "@kascad-app/shared-types";

import { SponsorsService } from "../services/sponsors.service";

import { Logged } from "src/common/decorators/logged.decorator";

@ApiTags("Sponsors")
@ApiBearerAuth()
@Controller()
@Logged()
export class SponsorsController {
  constructor(private _sponsorsService: SponsorsService) {}

  @Get()
  @ApiOperation({
    summary: "Get all sponsors",
    description: "Retrieves a list of all sponsors",
  })
  @ApiResponse({
    status: 200,
    description: "List of sponsors retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(): Promise<Sponsor[]> {
    return await this._sponsorsService.findAll();
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get sponsor by ID",
    description: "Retrieves a specific sponsor by their ID",
  })
  @ApiParam({ name: "id", type: String, description: "Sponsor ID" })
  @ApiResponse({ status: 200, description: "Sponsor retrieved successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "Sponsor not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id") id: string): Promise<Sponsor> {
    return await this._sponsorsService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: "Create new sponsor",
    description: "Creates a new sponsor account",
  })
  @ApiBody({ description: "Sponsor creation data" })
  @ApiResponse({ status: 201, description: "Sponsor created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createSponsorDto: registerSponsorDto): Promise<Sponsor> {
    return await this._sponsorsService.create(createSponsorDto);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Update sponsor",
    description: "Updates an existing sponsor account",
  })
  @ApiParam({ name: "id", type: String, description: "Sponsor ID" })
  @ApiBody({ description: "Sponsor update data" })
  @ApiResponse({ status: 200, description: "Sponsor updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "Sponsor not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id") id: string,
    @Body() updateSponsorDto: registerSponsorDto,
  ): Promise<Sponsor> {
    return await this._sponsorsService.update(id, updateSponsorDto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete sponsor",
    description: "Deletes a sponsor account",
  })
  @ApiParam({ name: "id", type: String, description: "Sponsor ID" })
  @ApiResponse({ status: 200, description: "Sponsor deleted successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "Sponsor not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id") id: string): Promise<void> {
    return await this._sponsorsService.remove(id);
  }
}
