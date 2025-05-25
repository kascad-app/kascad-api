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

import { ContractOffer } from "@kascad-app/shared-types";
import { Logged } from "src/common/decorators/logged.decorator";
import { ContractsOffersService } from "../services/contracts.service";

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
}
