import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
  SavedSearch,
  SavedSearchDocument,
} from "../schemas/saved-search.schema";
import { CreateSavedSearchDto } from "../types/search.dtos";

import { Model } from "mongoose";

@Injectable()
export class SavedSearchService {
  constructor(
    @InjectModel(SavedSearch.name)
    private readonly _savedSearchModel: Model<SavedSearchDocument>,
  ) {}

  getUserSavedSearches(userId: string) {
    return this._savedSearchModel.find({ sponsorId: userId });
  }

  createSavedSearch(body: CreateSavedSearchDto) {
    return this._savedSearchModel.create(body);
  }
}
