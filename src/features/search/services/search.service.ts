import { Injectable } from "@nestjs/common";

import { Rider } from "@kascad-app/shared-types";

import {
  getSearchPipeline,
  RiderSearchFilters,
} from "../aggregates/get-search-pipeline";

import { RidersService } from "src/features/riders/services/riders.service";

@Injectable()
export class SearchService {
  constructor(private readonly _riderService: RidersService) {}

  async search(filters: RiderSearchFilters): Promise<Rider[]> {
    console.log("Search filters:", filters);

    const pipeline = getSearchPipeline(filters);
    console.log("Generated pipeline:", JSON.stringify(pipeline, null, 2));

    return this._riderService.aggregate(pipeline);
  }

  async getSearchCount(filters: RiderSearchFilters): Promise<number> {
    const countFilters = { ...filters };
    delete countFilters.page;
    delete countFilters.limit;
    delete countFilters.sortBy;
    delete countFilters.sortOrder;

    const pipeline = getSearchPipeline(countFilters);

    const pipelineWithoutPagination = pipeline.slice(0, -3);
    pipelineWithoutPagination.push({
      $count: "total",
    });

    const results = (await this._riderService.aggregate(
      pipelineWithoutPagination,
    )) as any[];
    return results[0]?.total || 0;
  }
}
