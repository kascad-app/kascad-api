import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { CookieSerializeOptions } from "@fastify/cookie";
import {
  APIResponse,
  loginRiderDto,
  registerRiderDto,
  Rider,
  RiderMe,
} from "@kascad-app/shared-types";

import { RefreshAuthGuard } from "../guards/refresh-auth.guard";
import { RiderAuthService } from "../services/rider-auth.service";

import { FastifyReply } from "fastify";
import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { BadRequest } from "src/common/exceptions/bad-request.exception";

@Controller("auth/rider")
export class RiderAuthController {
  constructor(
    private _authService: RiderAuthService,
    private readonly _configService: ConfigService,
  ) {}

  private readonly cookieSerializeOptions: {
    accessToken: CookieSerializeOptions;
    refreshToken: CookieSerializeOptions;
  } = {
    accessToken: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: eval(this._configService.get<string>("JWT_ACCESSTOKEN_MAXAGE")),
    },
    refreshToken: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/auth/rider/refresh-token",
      maxAge: eval(this._configService.get<string>("JWT_REFRESH_TOKEN_MAXAGE")),
    },
  };

  @Logged()
  @Get("me")
  async getMe(@User() user: RiderMe) {
    return user;
  }

  @Post("register")
  async register(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() registerDto: registerRiderDto,
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

    res.setCookie("logged-in", "true", {
      ...this.cookieSerializeOptions.accessToken,
      httpOnly: false,
    });

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

  @Post("login")
  async login(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() data: loginRiderDto,
  ) {
    const result = await this._authService.login(data);

    if (result instanceof BadRequest) {
      throw result;
    }

    res.setCookie(
      "access-token",
      await this._authService.generateAccessToken(result),
      this.cookieSerializeOptions.accessToken,
    );

    res.setCookie("logged-in", "true", {
      ...this.cookieSerializeOptions.accessToken,
      httpOnly: false,
    });

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

  @Post("refresh-token")
  @UseGuards(RefreshAuthGuard)
  @Logged()
  async refreshToken(
    @Res({ passthrough: true }) res: FastifyReply,
    @User() user: Rider,
  ) {
    res.setCookie(
      "access-token",
      await this._authService.generateAccessToken(user),
      this.cookieSerializeOptions.accessToken,
    );

    res.setCookie("logged-in", "true", {
      ...this.cookieSerializeOptions.accessToken,
      httpOnly: false,
    });

    res.setCookie(
      "refresh-token",
      await this._authService.generateRefreshToken(user),
      this.cookieSerializeOptions.refreshToken,
    );

    return {
      success: true,
      data: user,
    };
  }

  @Post("logout")
  async signOut(
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<APIResponse> {
    res.clearCookie("access-token", {
      httpOnly: true,
      maxAge: 0,
    });
    res.clearCookie("refresh-token", {
      httpOnly: true,
      maxAge: 0,
    });

    res.setCookie("logged-in", "false", {
      ...this.cookieSerializeOptions.accessToken,
      httpOnly: false,
    });

    return {
      success: false,
      message: "Logged out successfully",
    };
  }
}
