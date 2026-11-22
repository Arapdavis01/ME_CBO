import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const prefix = process.env.API_PREFIX ?? "api/v1";
  app.setGlobalPrefix(prefix);

  // ─── Proxy trust ─────────────────────────────────────
  // Number of proxies between the visitor and this API. Traffic goes
  // browser -> Render (web) -> Next.js /api rewrite -> Render (API) -> here,
  // so the default is 3. Too low: every visitor looks like the same IP.
  // Too high: a caller can fake their IP. Verify with GET /health/ip
  // (set DEBUG_IP=true temporarily), then set TRUST_PROXY_HOPS.
  const hopsRaw = Number(process.env.TRUST_PROXY_HOPS ?? 3);
  const hops = Number.isInteger(hopsRaw) && hopsRaw >= 0 ? hopsRaw : 3;
  app.set("trust proxy", hops);

  // Close database/Redis connections cleanly when Render stops the service.
  app.enableShutdownHooks();

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
  // The web app calls the API through its own /api proxy, so CORS is only
  // needed for direct calls (testing, other tools).
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

  // ─── Swagger (never in production) ───────────────────
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
  await app.listen(port, "0.0.0.0");
  Logger.log(`🚀 ME_CBO API listening on port ${port} (/${prefix}), trust proxy = ${hops}`, "Bootstrap");
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
