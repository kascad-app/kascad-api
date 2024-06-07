import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { Sponsor } from '@kascad-app/shared-types';
import { SponsorsService } from './sponsors.service';

@Controller('sponsors')
export class SponsorsController {
  constructor(private sponsorsService: SponsorsService) {}

  @Get()
  async findAll(): Promise<Sponsor[]> {
    return this.sponsorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Sponsor> {
    return this.sponsorsService.findOne(id);
  }

  @Post()
  async create(@Body() createSponsorDto): Promise<Sponsor> {
    return this.sponsorsService.create(createSponsorDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSponsorDto,
  ): Promise<Sponsor> {
    return this.sponsorsService.update(id, updateSponsorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.sponsorsService.remove(id);
  }
}
