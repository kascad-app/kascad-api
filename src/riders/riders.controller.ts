import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { RidersService } from "./riders.service";
import { registerRiderDto, Rider } from "@kascad-app/shared-types";
import { Logged } from "src/common/decorators/logged.decorator";

@Controller("riders")
@Logged()
export class RidersController {
  constructor(private _ridersService: RidersService) {}

  @Get()
  async getRiders(): Promise<Rider[]> {
    return await this._ridersService.findAll();
  }

  @Get(":id")
  async getRider(@Param("id") id: string): Promise<Rider> {
    return await this._ridersService.findById(id);
  }

  @Put(":id")
  async updateRider(
    @Param("id") id: string,
    @Body() updateRider: Rider,
  ): Promise<Rider> {
    return this._ridersService.updateOne(id, updateRider);
  }

  @Delete(":id")
  async deleteRider(@Param("id") id: string): Promise<void> {
    return await this._ridersService.remove(id);
  }
}
