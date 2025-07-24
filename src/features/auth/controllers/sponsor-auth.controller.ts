import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";

import { CookieSerializeOptions } from "@fastify/cookie";
import {
  APIResponse,
  registerSponsorDto,
  Sponsor,
} from "@kascad-app/shared-types";

import { RefreshAuthGuard } from "../guards/refresh-auth.guard";
import { SponsorAuthService } from "../services/sponsor-auth.service";

import { FastifyReply } from "fastify";
import { Logged } from "src/common/decorators/logged.decorator";
import { User } from "src/common/decorators/user.decorator";
import { BadRequest } from "src/common/exceptions/bad-request.exception";

@ApiTags('Sponsor Authentication')
@Controller("auth/sponsor")
export class SponsorAuthController {
  constructor(
    private _authService: SponsorAuthService,
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
      path: "/auth/rider/refresh-token",
      maxAge: eval(this._configService.get<string>("JWT_REFRESH_TOKEN_MAXAGE")),
    },
  };

  @Get("me")
  @ApiOperation({ summary: 'Get current sponsor profile', description: 'Retrieves the authenticated sponsor profile information' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Sponsor profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @Logged()
  async getMe(@User() user: Sponsor) {
    return user;
  }

  @Post("register")
  @ApiOperation({ summary: 'Register new sponsor', description: 'Creates a new sponsor account and returns authentication tokens' })
  @ApiBody({ description: 'Sponsor registration data' })
  @ApiResponse({ status: 201, description: 'Sponsor registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or email already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() registerDto: registerSponsorDto,
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

    return result;
  }

  @Post("login")
  @ApiOperation({ summary: 'Login sponsor', description: 'Authenticates a sponsor and returns authentication tokens' })
  @ApiBody({ description: 'Sponsor login credentials' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() data: registerSponsorDto,
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

    return result;
  }

  @Post("refresh-token")
  @ApiOperation({ summary: 'Refresh access token', description: 'Refreshes the access token using the refresh token' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(RefreshAuthGuard)
  @Logged()
  async refreshToken(
    @Res({ passthrough: true }) res: FastifyReply,
    @User() user: Sponsor,
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

    return user;
  }

  @Post("logout")
  @ApiOperation({ summary: 'Logout sponsor', description: 'Logs out the sponsor by clearing authentication cookies' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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

    return;
  }
}
