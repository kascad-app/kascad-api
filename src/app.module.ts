import { ResendModule } from "nestjs-resend";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";

import { MongoDBConfigService } from "./config/database/mongodb.config";
import { FeaturesModule } from "./features/features.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

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
    ResendModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get("RESEND_KEY"),
      }),
      inject: [ConfigService],
    }),
    FeaturesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
