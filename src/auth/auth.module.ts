import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RidersModule } from "src/riders/riders.module";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PermissionGuard } from "./guards/permission.guard";
import { APP_GUARD } from "@nestjs/core";
import { AuthenticationGuard } from "./guards/authentication.guard";
import { SponsorsModule } from "src/sponsors/sponsors.module";
import { MongooseModule } from "@nestjs/mongoose";
import MongoDBConnection from "src/common/constants/mongoDbConnections";
import { MongoDBConfigService } from "src/config/database/mongodb.config";

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
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
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
