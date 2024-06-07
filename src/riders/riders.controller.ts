import { Controller, Delete, Get, Put } from "@nestjs/common";

@Controller("riders")
export class RidersController {
  @Get()
  async getRiders() {}

  @Get(":id")
  async getRider() {}

  @Put(":id")
  async updateRider() {}

  @Delete(":id")
  async deleteRider() {}
}
