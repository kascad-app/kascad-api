import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";

import { RiderAuthController } from "./controllers/rider-auth.controller";
import { SponsorAuthController } from "./controllers/sponsor-auth.controller";
import { AuthenticationGuard } from "./guards/authentication.guard";
import { PermissionGuard } from "./guards/permission.guard";
import { RiderAuthService } from "./services/rider-auth.service";
import { SponsorAuthService } from "./services/sponsor-auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";

import MongoDBConnection from "src/common/constants/mongoDbConnections";
import { MongoDBConfigService } from "src/config/database/mongodb.config";
import { RidersModule } from "src/features/riders/riders.module";
import { SponsorsModule } from "src/features/sponsors/sponsors.module";
import { GcpModule } from "src/shared/gcp/gcp.module";

@Module({
  imports: [
    RidersModule,
    SponsorsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
      connectionName: MongoDBConnection.AUTH,
    }),
    GcpModule,
  ],

  controllers: [RiderAuthController, SponsorAuthController],
  providers: [
    RiderAuthService,
    SponsorAuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: "JwtAccessTokenService",
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtService => {
        return new JwtService({
          secret: configService.get<string>("JWT_ACCESSTOKEN_SECRET"),
          signOptions: {
            expiresIn: configService.get<string>("JWT_ACCESSTOKEN_EXPIRESIN"),
          },
        });
      },
    },
    {
      provide: "JwtRefreshTokenService",
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtService => {
        return new JwtService({
          secret: configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
          signOptions: {
            expiresIn: configService.get<string>("JWT_REFRESH_TOKEN_EXPIRESIN"),
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
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
