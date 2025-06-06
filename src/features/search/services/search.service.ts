import { Injectable } from "@nestjs/common";

import { getSearchPipeline } from "../aggregates/get-search-pipeline";

import { RidersService } from "src/features/riders/services/riders.service";

type SearchDto = {
  [key: string]: string | number | boolean;
};

@Injectable()
export class SearchService {
  constructor(private readonly _riderService: RidersService) {}

  search(search: SearchDto) {
    console.log(search);
    return this._riderService.aggregate(getSearchPipeline(search));
  }
}
