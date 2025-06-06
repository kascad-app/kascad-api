import { Module } from "@nestjs/common";

import { ScoutingController } from "./controllers/scouting.controller";

@Module({
  imports: [],
  controllers: [ScoutingController],
  providers: [],
  exports: [],
})
export class ScoutingModule {}
