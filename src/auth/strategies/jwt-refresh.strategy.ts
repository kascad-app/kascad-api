import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request as RequestType } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(_configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: _configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: _configService.get<number>("JWT_REFRESH_EXPIRATION_TIME"),
      passReqToCallback: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(req: RequestType, payload: any) {
    const refreshToken = req.cookies.refresh;
    return { ...payload, refreshToken };
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && "refresh-token" in req.cookies) {
      return req.cookies["refresh-token"];
    }
    return null;
  }
}
