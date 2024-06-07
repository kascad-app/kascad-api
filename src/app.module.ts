import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RidersModule } from "./riders/riders.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongoDBConfigService } from "./config/database/mongodb.config";
import { SponsorsController } from "./sponsors/sponsors.controller";
import { SponsorsModule } from "./sponsors/sponsors.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env["NODE_ENV"] === "production"
          ? [".env.production", ".env"]
          : [
              ".env.development.local",
              ".env.local",
              ".env.development",
              ".env",
            ],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useClass: MongoDBConfigService,
      inject: [ConfigService],
    }),
    RidersModule,
    SponsorsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
