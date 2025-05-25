import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";

import { Rider } from "@kascad-app/shared-types";

import { RidersService } from "../services/riders.service";

import { Logged } from "src/common/decorators/logged.decorator";

@Controller()
@Logged()
export class RidersController {
  constructor(private _ridersService: RidersService) {}

  @Get()
  async getRiders(): Promise<Rider[]> {
    return await this._ridersService.findAll();
  }

  @Get(":slug")
  async getRider(@Param("slug") slugRider: string): Promise<Rider> {
    return await this._ridersService.findBySlug(slugRider);
  }

  // A supprimer lors du deploy de l'API
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
