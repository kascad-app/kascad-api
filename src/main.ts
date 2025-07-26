import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import fastifyCookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService
      .get<string>("CORS_ORIGIN")
      .split(", ")
      .map((x) => x.trim()),
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

  await app.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20 MB max
    },
  });

  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "validator.swagger.io"],
        scriptSrc: ["'self'", "https: 'unsafe-inline'"],
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle("Kascad API")
    .setDescription("Kascad API description")
    .setVersion("1.0")
    .addTag("kascad")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(parseInt(process.env.PORT || "8080", 10), "0.0.0.0");
}
bootstrap();
