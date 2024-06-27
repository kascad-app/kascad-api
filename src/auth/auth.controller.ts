import { Body, Controller, Post, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { registerRiderDto, registerSponsorDto } from "@kascad-app/shared-types";
import { CookieSerializeOptions } from "@fastify/cookie";
import { FastifyReply } from "fastify";
import { BadRequest } from "src/common/exceptions/bad-request.exception";
@Controller("auth")
export class AuthController {
  constructor(
    private _authService: AuthService,
    private readonly _configService: ConfigService,
  ) {}

  private readonly cookieSerializeOptions: {
    accessToken: CookieSerializeOptions;
    refreshToken: CookieSerializeOptions;
  } = {
    accessToken: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: this._configService.get<number>("JWT_ACCESSTOKEN_EXPIRESIN"),
    },
    refreshToken: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/auth/refresh-token",
      maxAge: this._configService.get<number>("JWT_REFRESH_EXPIRATION_TIME"),
    },
  };

  @Post("register")
  async register(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() registerDto: registerRiderDto | registerSponsorDto,
  ) {
    const response = await this._authService.register(registerDto);

    if (response instanceof BadRequest) {
      throw response;
    }

    console.log(typeof response);

    return {
      success: true,
      data: response,
    };
  }
}
