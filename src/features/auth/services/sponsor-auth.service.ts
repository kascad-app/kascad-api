import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import {
  loginSponsorDto,
  registerSponsorDto,
  Sponsor,
} from "@kascad-app/shared-types";

import * as bcrypt from "bcrypt";
import { BadRequest } from "src/common/exceptions/bad-request.exception";
import { SponsorsService } from "src/features/sponsors/services/sponsors.service";

@Injectable()
export class SponsorAuthService {
  constructor(
    private _sponsorsService: SponsorsService,
    @Inject("JwtAccessTokenService")
    private readonly _accessTokenService: JwtService,
    @Inject("JwtRefreshTokenService")
    private readonly _refreshTokenService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async register(registerDto: registerSponsorDto) {
    const isSponsorExist: Sponsor[] = await this._sponsorsService.search({
      "identifier.email": registerDto.email,
    });

    if (isSponsorExist && isSponsorExist.length > 0)
      return new BadRequest("Sponsor already exists");

    return await this._sponsorsService.create(registerDto);
  }

  async login(loginDto: loginSponsorDto) {
    const isSponsorExist: Sponsor[] = await this._sponsorsService.search({
      "identifier.email": loginDto.email,
    });

    if (!isSponsorExist || isSponsorExist.length === 0)
      throw new BadRequest("Sponsor not found");

    const sponsor = isSponsorExist[0];

    const isPasswordValid: boolean =
      await this._sponsorsService.compareEncryptedPassword(
        sponsor._id,
        loginDto.password,
      );

    if (!isPasswordValid) throw new BadRequest("Incorrect password");

    return sponsor;
  }

  async generateAccessToken(user: Sponsor): Promise<string> {
    return this._accessTokenService.sign({
      user: user._id,
      accountType: user.type,
    });
  }

  async generateRefreshToken(user: Sponsor): Promise<string> {
    return this._refreshTokenService.sign({
      user: user._id,
      accountType: user.type,
    });
  }
}
