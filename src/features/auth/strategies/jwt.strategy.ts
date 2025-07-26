import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { Rider, Sponsor } from "@kascad-app/shared-types";

import { FastifyRequest as RequestType } from "fastify";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RidersService } from "src/features/riders/services/riders.service";
import { SponsorsService } from "src/features/sponsors/services/sponsors.service";

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
      // expiresIn: configService.get<number>("JWT_ACCESSTOKEN_EXPIRESIN"),
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
      return await this._ridersService.findById(payload.user);
    } else {
      return await this._sponsorService.findById(payload.user);
    }
  }
}
