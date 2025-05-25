import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from "@nestjs/common";
import { FastifyReply } from "fastify";

import {
  ContractOffer,
  messagePayloadDto,
  registerMessageDto,
  Rider,
  Sponsor,
} from "@kascad-app/shared-types";
import { Logged } from "src/common/decorators/logged.decorator";
import { ContractsOffersService } from "../services/contracts.service";
import { User } from "src/common/decorators/user.decorator";

@Controller()
@Logged()
export class ContractsOffersController {
  constructor(private _contractsService: ContractsOffersService) {}

  @Get()
  async getAll(): Promise<ContractOffer[]> {
    return await this._contractsService.findAll();
  }

  @Get(":id")
  async getOne(@Param("id") id: string): Promise<ContractOffer> {
    return await this._contractsService.findById(id);
  }

  @Post()
  async create(
    @Body() createContractOfferDto: ContractOffer,
  ): Promise<ContractOffer> {
    return await this._contractsService.create(createContractOfferDto);
  }

  @Post(":id/sendMessage")
  async sendMessage(
    @Param("id") id: string,
    @User("user") user: Rider | Sponsor,
    @Body() messageDto: messagePayloadDto,
  ): Promise<registerMessageDto> {
    return await this._contractsService.insertMessage(id, user, messageDto);
  }
}
