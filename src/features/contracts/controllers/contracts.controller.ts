import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import {
  ContractOffer,
  getContractsDto,
  Message,
  registerMessageDto,
  Rider,
  Sponsor,
} from "@kascad-app/shared-types";

import { ContractsOffersService } from "../services/contracts.service";

import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";

@Controller()
export class ContractsOffersController {
  constructor(private _contractsService: ContractsOffersService) {}

  @Get()
  @Logged()
  async getAll(): Promise<getContractsDto[]> {
    return await this._contractsService.findAll();
  }

  @Get(":id")
  @Logged()
  async getOne(@Param("id") id: string): Promise<getContractsDto> {
    return await this._contractsService.findById(id);
  }

  @Post()
  @Logged()
  async create(
    @Body() createContractOfferDto: ContractOffer,
  ): Promise<ContractOffer> {
    return await this._contractsService.create(createContractOfferDto);
  }

  @Post(":id/sendMessage")
  @Logged()
  async sendMessage(
    @Param("id") id: string,
    @User() user: Rider | Sponsor,
    @Body() messageDto: registerMessageDto,
  ): Promise<Message> {
    return await this._contractsService.insertMessage(id, user, messageDto);
  }
}
