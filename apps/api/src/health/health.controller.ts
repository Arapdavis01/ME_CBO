import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Req,
  ServiceUnavailableException,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { ApiExcludeController } from "@nestjs/swagger";
import type { Request } from "express";
import { Public } from "../auth/decorators/public.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

@ApiExcludeController()
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Liveness: no database or Redis. Use this for the uptime pinger
   * so it never loads or wakes the database.
   */
  @Public()
  @SkipThrottle()
  @Get()
  @HttpCode(200)
  check() {
    return { status: "ok", uptime: Math.round(process.uptime()) };
  }

  /** Readiness: checks the database and Redis. Do not ping this every few minutes. */
  @Public()
  @SkipThrottle()
  @Get("ready")
  @HttpCode(200)
  async ready() {
    const [db, redis] = await Promise.all([this.prisma.isHealthy(), this.redis.ping()]);
    if (!db) {
      throw new ServiceUnavailableException({ status: "down", db, redis });
    }
    return { status: redis ? "ok" : "degraded", db, redis };
  }

  /**
   * Temporary check for TRUST_PROXY_HOPS. Enabled only when DEBUG_IP=true.
   * Compare "ip" with your real address (search "what is my IP"). They must
   * match. Turn DEBUG_IP off again afterwards.
   */
  @Public()
  @SkipThrottle()
  @Get("ip")
  @HttpCode(200)
  ip(@Req() req: Request) {
    if (process.env.DEBUG_IP !== "true") throw new NotFoundException();
    return {
      ip: req.ip,
      ips: req.ips,
      forwardedFor: req.headers["x-forwarded-for"] ?? null,
    };
  }
}
