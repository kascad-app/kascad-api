import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { Article, registerArticleDto } from "@kascad-app/shared-types";

import { ArticlesService } from "../services/articles.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { BadRequest } from "src/common/exceptions/bad-request.exception";

@Controller()
export class ArticlesController {
  constructor(private _articlesService: ArticlesService) {}

  @Post()
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
  @Logged()
  async getRiders(): Promise<Article[]> {
    return await this._articlesService.findAll();
  }

  @Get(":id")
  @Logged()
  async getRider(@Param("id") id: string): Promise<Article> {
    return await this._articlesService.findById(id);
  }

  @Put(":id")
  @Logged()
  async updateRider(
    @Param("id") id: string,
    @Body() updateArticle: Article,
  ): Promise<Article> {
    return this._articlesService.updateOne(id, updateArticle);
  }

  @Delete(":id")
  @Logged()
  async deleteRider(@Param("id") id: string): Promise<void> {
    return await this._articlesService.remove(id);
  }
}
