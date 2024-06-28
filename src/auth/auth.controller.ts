import { Body, Controller, Logger, Post, Res } from "@nestjs/common";
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
      maxAge: eval(this._configService.get<string>("JWT_ACCESSTOKEN_MAXAGE")),
    },
    refreshToken: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/auth/refresh-token",
      maxAge: eval(this._configService.get<string>("JWT_REFRESH_TOKEN_MAXAGE")),
    },
  };

  @Post("register")
  async register(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() registerDto: registerRiderDto | registerSponsorDto,
  ) {
    const result = await this._authService.register(registerDto);

    if (result instanceof BadRequest) {
      throw result;
    }
    res.setCookie(
      "access-token",
      await this._authService.generateAccessToken(result),
      this.cookieSerializeOptions.accessToken,
    );

    res.setCookie(
      "refresh-token",
      await this._authService.generateRefreshToken(result),
      this.cookieSerializeOptions.refreshToken,
    );

    return {
      success: true,
      data: result,
    };
  }
}
