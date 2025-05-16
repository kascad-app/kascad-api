import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";

import { Article } from "@kascad-app/shared-types";

import { ArticlesService } from "../services/articles.service";

import { Logged } from "src/common/decorators/logged.decorator";

@Controller()
@Logged()
export class ArticlesController {
  constructor(private _articlesService: ArticlesService) {}

  @Get()
  async getRiders(): Promise<Article[]> {
    return await this._articlesService.findAll();
  }

  @Get(":id")
  async getRider(@Param("id") id: string): Promise<Article> {
    return await this._articlesService.findById(id);
  }

  @Put(":id")
  async updateRider(
    @Param("id") id: string,
    @Body() updateArticle: Article,
  ): Promise<Article> {
    return this._articlesService.updateOne(id, updateArticle);
  }

  @Delete(":id")
  async deleteRider(@Param("id") id: string): Promise<void> {
    return await this._articlesService.remove(id);
  }
}
