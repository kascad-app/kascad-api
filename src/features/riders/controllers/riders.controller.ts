import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { Rider, RiderMe } from "@kascad-app/shared-types";

import { RidersService } from "../services/riders.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";

@Controller()
export class RidersController {
  constructor(private _ridersService: RidersService) {}

  @Get()
  @Logged()
  async getRiders(): Promise<Rider[]> {
    return await this._ridersService.findAll();
  }

  @Get(":slug")
  @Logged()
  async getRider(
    @Param("slug") slugRider: string,
    @User() user: RiderMe,
  ): Promise<Rider> {
    await this._ridersService.addViewEntry(user._id, slugRider);
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

  // @Delete(":id")
  // @Logged()
  // async deleteRider(@Param("id") id: string): Promise<void> {
  //   return await this._ridersService.remove(id);
  // }
}
