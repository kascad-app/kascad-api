import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import {
  SavedSearch,
  SavedSearchDocument,
} from "../schemas/saved-search.schema";
import {
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from "../types/search.dtos";

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

  create(body: CreateSavedSearchDto) {
    return this._savedSearchModel.create(body);
  }

  update(userId: string, savedSearchId: string, body: UpdateSavedSearchDto) {
    return this._savedSearchModel.updateOne(
      { _id: savedSearchId, sponsorId: userId },
      body,
    );
  }

  delete(userId: string, savedSearchId: string) {
    return this._savedSearchModel.deleteOne({
      _id: savedSearchId,
      sponsorId: userId,
    });
  }
}
