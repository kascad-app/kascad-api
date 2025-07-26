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

import { Article, registerArticleDto } from "@kascad-app/shared-types";

import { ArticlesService } from "../services/articles.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { BadRequest } from "src/common/exceptions/bad-request.exception";

@ApiTags("Articles")
@ApiBearerAuth()
@Controller()
export class ArticlesController {
  constructor(private _articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({
    summary: "Create article",
    description: "Creates a new article",
  })
  @ApiBody({ description: "Article creation data" })
  @ApiResponse({ status: 201, description: "Article created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
  async create(@Body() registerDto: registerArticleDto) {
    const result = await this._articlesService.create(registerDto);

    if (result instanceof BadRequest) {
      throw result;
    }

    return {
      success: true,
      data: result,
    };
  }

  @Get()
  @ApiOperation({
    summary: "Get all articles",
    description: "Retrieves a list of all articles",
  })
  @ApiResponse({ status: 200, description: "Articles retrieved successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
  async getRiders(): Promise<Article[]> {
    return await this._articlesService.findAll();
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get article by ID",
    description: "Retrieves a specific article by its ID",
  })
  @ApiParam({ name: "id", type: String, description: "Article ID" })
  @ApiResponse({ status: 200, description: "Article retrieved successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "Article not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
  async getRider(@Param("id") id: string): Promise<Article> {
    return await this._articlesService.findById(id);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Update article",
    description: "Updates an existing article",
  })
  @ApiParam({ name: "id", type: String, description: "Article ID" })
  @ApiBody({ description: "Article update data" })
  @ApiResponse({ status: 200, description: "Article updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "Article not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
  async updateRider(
    @Param("id") id: string,
    @Body() updateArticle: Article,
  ): Promise<Article> {
    return this._articlesService.updateOne(id, updateArticle);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete article",
    description: "Deletes an existing article",
  })
  @ApiParam({ name: "id", type: String, description: "Article ID" })
  @ApiResponse({ status: 200, description: "Article deleted successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @ApiResponse({ status: 404, description: "Article not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Logged()
  async deleteRider(@Param("id") id: string): Promise<void> {
    return await this._articlesService.remove(id);
  }
}
