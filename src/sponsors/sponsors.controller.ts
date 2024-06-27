import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { registerSponsorDto } from "@kascad-app/shared-types";
import { Sponsor } from "./schemas/sponsor.schema";
import { SponsorsService } from "./sponsors.service";

@Controller("sponsors")
export class SponsorsController {
  constructor(private _sponsorsService: SponsorsService) {}

  @Get()
  async findAll(): Promise<Sponsor[]> {
    return await this._sponsorsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Sponsor> {
    return await this._sponsorsService.findById(id);
  }

  @Post()
  async create(@Body() createSponsorDto: registerSponsorDto): Promise<Sponsor> {
    return await this._sponsorsService.create(createSponsorDto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateSponsorDto: Sponsor,
  ): Promise<Sponsor> {
    return await this._sponsorsService.update(id, updateSponsorDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    return await this._sponsorsService.remove(id);
  }
}
