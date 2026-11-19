import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";

/* ─── Core infrastructure ────────────────────────────────────────── */
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { AuditModule } from "./audit/audit.module";

/* ─── Global feature providers (B2) ──────────────────────────────── */
import { EmailModule } from "./email/email.module";
import { StorageModule } from "./storage/storage.module";

/* ─── Feature modules ────────────────────────────────────────────── */
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";

/* ─── Cross-cutting concerns ─────────────────────────────────────── */
import { ThrottlerBehindProxyGuard } from "./common/guards/throttler.guard";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

@Module({
  imports: [
    /* ─── Config first — everything else depends on env vars ───── */
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [".env.local", ".env"],
    }),

    /* ─── Rate limiting — global default, per-route overrides ─── */
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60_000, limit: 120 },
    ]),

    /* ─── Global infrastructure (marked @Global inside) ───────── */
    PrismaModule,
    RedisModule,
    AuditModule,
    EmailModule,
    StorageModule,

    /* ─── Domain modules ──────────────────────────────────────── */
    AuthModule,
    UsersModule,
    EventsModule,
    HealthModule,
  ],

  providers: [
    /* Order matters: throttler runs first, then JwtAuthGuard + RbacGuard
       are registered inside AuthModule itself so they also apply there. */
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },

    /* Unified error shape for every exception, incl. Prisma errors */
    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    /* Timing log for every HTTP request */
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
