import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RidersModule } from "src/riders/riders.module";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RefreshTokenStrategy } from "./strategies/jwt-refresh.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PermissionGuard } from "./guards/permission.guard";
import { APP_GUARD } from "@nestjs/core";
import { AuthenticationGuard } from "./guards/authentication.guard";

@Module({
  imports: [RidersModule, PassportModule.register({ defaultStrategy: "jwt" })],

  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: "JwtAccessTokenService",
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtService => {
        return new JwtService({
          secret: configService.get<string>("JWT_ACCESSTOKEN_SECRET"),
          signOptions: {
            expiresIn: configService.get<number>("JWT_ACCESSTOKEN_EXPIRESIN"),
          },
        });
      },
    },
    {
      provide: "JwtRefreshTokenService",
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtService => {
        return new JwtService({
          secret: configService.get<string>("JWT_REFRESHTOKEN_SECRET"),
          signOptions: {
            expiresIn: configService.get<number>("JWT_REFRESH_EXPIRATION_TIME"),
          },
        });
      },
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    JwtStrategy,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
