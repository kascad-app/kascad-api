import {
  loginRiderDto,
  loginSponsorDto,
  registerRiderDto,
  registerSponsorDto,
  Rider,
  Sponsor,
} from "@kascad-app/shared-types";
import { Inject, Injectable } from "@nestjs/common";
import { RidersService } from "src/riders/riders.service";
import * as bcrypt from "bcrypt";
import { BadRequest } from "src/common/exceptions/bad-request.exception";
import { JwtService } from "@nestjs/jwt";

type User = Rider | Sponsor;

@Injectable()
export class AuthService {
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

  async register(registerDto: registerRiderDto | registerSponsorDto) {
    return registerDto.type === "rider"
      ? this.registerRider(registerDto)
      : this.registerSponsor(registerDto);
  }

  async login(loginDto: loginRiderDto | loginSponsorDto) {
    return loginDto.type === "rider"
      ? this.loginRider(loginDto)
      : this.loginSponsor(loginDto);
  }

  async generateAccessToken(user: User): Promise<string> {
    return this._accessTokenService.sign(
      {
        user: user._id,
        accountType: user.type,
      },
      {
        subject: user._id,
      },
    );
  }

  async generateRefreshToken(user: User): Promise<string> {
    return this._refreshTokenService.sign(
      {
        user: user._id,
        accountType: user.type,
      },
      {
        subject: user._id,
      },
    );
  }

  /**
   *
   *--------------------------------------------------
   * ---------------- PRIVATE METHODS ----------------
   *--------------------------------------------------
   *
   */

  /**
   *
   *   RIDERS
   *
   */

  private async registerRider(registerDto: registerRiderDto) {
    const isRiderExist: Rider[] = await this._ridersService.search({
      email: registerDto.email,
    });

    if (isRiderExist && isRiderExist.length > 0)
      return new BadRequest("Rider already exists");

    return await this._ridersService.create(registerDto);
  }

  private async loginRider(loginDto: loginRiderDto) {
    const riderExist = await this._ridersService.search({
      email: loginDto.email,
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

  /**
   *
   *   Sponsor
   *
   */
  private async registerSponsor(registerDto: registerSponsorDto) {}

  private async loginSponsor(loginDto: loginSponsorDto) {}
}
