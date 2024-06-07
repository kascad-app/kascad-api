import {
  loginRiderDto,
  loginSponsorDto,
  registerRiderDto,
  registerSponsorDto,
  Rider,
} from "@kascad-app/shared-types";
import { Injectable } from "@nestjs/common";
import { RidersService } from "src/riders/riders.service";
import * as bcrypt from "bcrypt";
import { BadRequest } from "src/common/exceptions/bad-request.exception";

@Injectable()
export class AuthService {
  constructor(
    private _ridersService: RidersService,
    // @Inject("JwtAccessTokenService")
    // private readonly _accessTokenService: JwtService,
    // @Inject("JwtRefreshTokenService")
    // private readonly _refreshTokenService: JwtService,
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

  /**
   *
   *--------------------------------------------------
   * ---------------- PRIVATE METHODS ----------------
   *--------------------------------------------------
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

  private async registerSponsor(registerDto: registerSponsorDto) {}

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

  private async loginSponsor(loginDto: loginSponsorDto) {}
}
