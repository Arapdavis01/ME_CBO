import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const prefix = process.env.API_PREFIX ?? "api/v1";
  app.setGlobalPrefix(prefix);

  // ─── Security headers ────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false, // handled by frontend
    }),
  );

  // ─── Cookies (for HttpOnly JWT) ──────────────────────
  app.use(cookieParser());

  // ─── CORS (credentials required for cookies) ─────────
  const origins = (process.env.APP_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });

  // ─── Validation ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger ─────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("ME_CBO API")
      .setDescription("Mosoriot Environmental Community-Based Organization")
      .setVersion("1.0")
      .addCookieAuth("me_access", { type: "apiKey", in: "cookie" })
      .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${prefix}/docs`, app, doc);
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  Logger.log(`🚀 ME_CBO API listening on http://localhost:${port}/${prefix}`, "Bootstrap");
  Logger.log(`📚 Swagger: http://localhost:${port}/${prefix}/docs`, "Bootstrap");
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
