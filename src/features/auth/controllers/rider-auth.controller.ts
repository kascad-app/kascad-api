import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

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

@ApiTags("Rider Authentication")
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

  @Get("me")
  @ApiOperation({
    summary: "Get current rider profile",
    description: "Retrieves the authenticated rider profile information",
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Rider profile retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  @Logged()
  async getMe(@User() user: RiderMe) {
    return user;
  }

  @Post("register")
  @ApiOperation({
    summary: "Register new rider",
    description:
      "Creates a new rider account and returns authentication tokens",
  })
  @ApiBody({ description: "Rider registration data" })
  @ApiResponse({ status: 201, description: "Rider registered successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid input data or email already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Login rider",
    description: "Authenticates a rider and returns authentication tokens",
  })
  @ApiBody({ description: "Rider login credentials" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 400, description: "Invalid credentials" })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Refresh access token",
    description: "Refreshes the access token using the refresh token",
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
  @ApiOperation({
    summary: "Logout rider",
    description: "Logs out the rider by clearing authentication cookies",
  })
  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiResponse({ status: 500, description: "Internal server error" })
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
