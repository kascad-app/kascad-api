import { Body, Controller, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { registerRiderDto, registerSponsorDto } from "@kascad-app/shared-types";

@Controller("auth")
export class AuthController {
  constructor(
    private _authService: AuthService,
    private readonly _configService: ConfigService,
  ) {}

  @Post("register")
  async register(@Body() registerDto: registerRiderDto | registerSponsorDto) {
    return await this._authService.register(registerDto);
  }
}
