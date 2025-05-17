import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Article, registerArticleDto } from "@kascad-app/shared-types";
import { ArticleDocument } from "../schemas/article.schema";

type ArticleSearchParams = {
  [key: string]: string | number | boolean;
};

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel("Article")
    private readonly _articleModel: Model<ArticleDocument>,
  ) {}

  async search(params?: ArticleSearchParams): Promise<Article[]> {
    let query = {};
    if (params) {
      query = {
        $or: Object.entries(params).map(([key, value]) => ({ [key]: value })),
      };
    }
    return await this._articleModel.find(query).exec();
  }

  async findAll(): Promise<Article[]> {
    return await this._articleModel.find().exec();
  }

  async findById(id: string): Promise<Article> {
    return await this._articleModel.findById(id).exec();
  }

  async create(createArticleDto: registerArticleDto): Promise<Article> {
    const newArticle = new this._articleModel(createArticleDto);
    return await newArticle.save();
  }

  async updateOne(
    id: string,
    updateArticleDto: Partial<Article>,
  ): Promise<Article> {
    return await this._articleModel
      .findByIdAndUpdate(id, updateArticleDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this._articleModel.findByIdAndDelete(id).exec();
  }
}
