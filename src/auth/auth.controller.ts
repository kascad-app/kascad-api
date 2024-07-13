import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import {
  APIResponse,
  loginRiderDto,
  registerRiderDto,
  registerSponsorDto,
  StatusCode,
  UnknowProfile,
} from "@kascad-app/shared-types";
import { CookieSerializeOptions } from "@fastify/cookie";
import { FastifyReply } from "fastify";
import { BadRequest } from "src/common/exceptions/bad-request.exception";
import { RefreshAuthGuard } from "./guards/refresh-auth.guard";
import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";

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

  @Post("login")
  async login(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() data: loginRiderDto | registerSponsorDto,
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
    @User() user: UnknowProfile,
  ) {
    res.cookie(
      "access-token",
      await this._authService.generateAccessToken(user),
      this.cookieSerializeOptions.accessToken,
    );
    res.cookie(
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
  @HttpCode(StatusCode.SuccessNoContent)
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

    return {
      success: true,
    };
  }
}
