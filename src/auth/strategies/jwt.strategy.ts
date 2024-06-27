import { Rider, Sponsor } from "@kascad-app/shared-types";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request as RequestType } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RidersService } from "src/riders/riders.service";
import { SponsorsService } from "src/sponsors/sponsors.service";

type JwtToken = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private _ridersService: RidersService,
    private _sponsorService: SponsorsService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      secretOrKey: configService.get<string>("JWT_ACCESSTOKEN_SECRET"),
      expiresIn: configService.get<number>("JWT_ACCESSTOKEN_EXPIRESIN"),
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && "access-token" in req.cookies) {
      return req.cookies["access-token"];
    }
    return null;
  }

  async validate(payload: JwtToken): Promise<Rider | Sponsor> {
    if (payload.accountType === "rider") {
      return await this._ridersService.findById(payload.sub);
    } else {
      return await this._sponsorService.findById(payload.sub);
    }
  }
}
