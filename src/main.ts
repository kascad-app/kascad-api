// A rajouter si utilisation de Node.js avec une version < 19
// global.crypto = require("crypto");

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

import fastifyCookie from "@fastify/cookie";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN").split(", "),
    credentials: true,
    exposedHeaders: configService
      .get<string>("CORS_EXPOSED_HEADERS", "")
      .split(", "),
    methods: configService.get<string>("CORS_ALLOWED_METHODS", "").split(", "),
    allowedHeaders: configService
      .get<string>("CORS_ALLOWED_HEADERS", "")
      .split(", "),
  });

  await app.register(fastifyCookie, {
    secret: configService.get<string>("COOKIE_SECRET"),
  });

  await app.listen(parseInt(process.env.PORT || "8080", 10), "0.0.0.0");
}
bootstrap();
