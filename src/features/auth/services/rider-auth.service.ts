import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import {
  loginRiderDto,
  registerRiderDto,
  Rider,
  RiderMe,
  updateRiderDto,
} from "@kascad-app/shared-types";

import * as bcrypt from "bcrypt";
import { BadRequest } from "src/common/exceptions/bad-request.exception";
import { RidersService } from "src/features/riders/services/riders.service";

@Injectable()
export class RiderAuthService {
  constructor(
    private _ridersService: RidersService,
    @Inject("JwtAccessTokenService")
    private readonly _accessTokenService: JwtService,
    @Inject("JwtRefreshTokenService")
    private readonly _refreshTokenService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async register(registerDto: registerRiderDto) {
    const isRiderExist: Rider[] = await this._ridersService.search({
      "identifier.email": registerDto.email,
    });

    if (isRiderExist && isRiderExist.length > 0)
      return new BadRequest("Rider already exists");

    const slugRider = await this._ridersService.generateSlug(
      registerDto.firstName,
      registerDto.lastName,
    );

    return await this._ridersService.create(registerDto, slugRider);
  }

  async login(loginDto: loginRiderDto) {
    const riderExist = await this._ridersService.search({
      "identifier.email": loginDto.email,
    });

    if (!riderExist || riderExist.length === 0)
      return new BadRequest("Rider not found");

    const rider = riderExist[0];

    const isPasswordValid: boolean =
      await this._ridersService.compareEncryptedPassword(
        rider._id,
        loginDto.password,
      );

    if (!isPasswordValid) throw new BadRequest("Incorrect password");

    return rider;
  }

  async generateAccessToken(user: Rider): Promise<string> {
    return this._accessTokenService.sign({
      user: user._id,
      accountType: user.type,
    });
  }

  async generateRefreshToken(user: Rider): Promise<string> {
    return this._refreshTokenService.sign({
      user: user._id,
      accountType: user.type,
    });
  }
}
