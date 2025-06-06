import { Injectable } from "@nestjs/common";

type SearchScoutingDto = {
  [key: string]: string | number | boolean;
};

@Injectable()
export class ScoutingService {
  search(searchScoutingDto: SearchScoutingDto) {
    console.log(searchScoutingDto);
    return "search";
  }
}
