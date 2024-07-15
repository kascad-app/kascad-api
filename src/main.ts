import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import fastifyCookie from "@fastify/cookie";
import { ConfigService } from "@nestjs/config";

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
    secret: configService.get("COOKIE_SECRET"),
  });

  await app.listen(process.env.PORT || 1337);
}
bootstrap();
