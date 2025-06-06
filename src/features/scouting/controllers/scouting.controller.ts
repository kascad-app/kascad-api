import { Body, Controller, Post } from "@nestjs/common";

import { ScoutingService } from "../services/scouting.services";

import { Logged } from "src/common/decorators/logged.decorator";

type SearchScoutingDto = {
  [key: string]: string | number | boolean;
};

@Controller()
@Logged()
export class ScoutingController {
  constructor(private readonly scoutingService: ScoutingService) {}

  @Post("search")
  async search(@Body() searchScoutingDto: SearchScoutingDto) {
    return this.scoutingService.search(searchScoutingDto);
  }
}
