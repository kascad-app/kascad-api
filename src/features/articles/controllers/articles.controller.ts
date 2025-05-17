import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from "@nestjs/common";

import { Article, registerArticleDto } from "@kascad-app/shared-types";

import { ArticlesService } from "../services/articles.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { FastifyReply } from "fastify";
import { BadRequest } from "src/common/exceptions/bad-request.exception";

@Controller()
@Logged()
export class ArticlesController {
  constructor(private _articlesService: ArticlesService) {}

  @Post()
  async create(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() registerDto: registerArticleDto,
  ) {
    const result = await this._articlesService.create(registerDto);

    console.log(res);

    if (result instanceof BadRequest) {
      throw result;
    }

    return {
      success: true,
      data: result,
    };
  }

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
