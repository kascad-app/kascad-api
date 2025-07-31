import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@ApiTags("Health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: "Health check",
    description: "Returns a simple health check message",
  })
  @ApiResponse({ status: 200, description: "API is healthy" })
  getHello(): string {
    return this.appService.getHello();
  }
}
