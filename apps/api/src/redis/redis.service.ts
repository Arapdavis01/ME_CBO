import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor() {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
      connectTimeout: 5_000,
      // Fail fast instead of hanging a request when Redis is unreachable.
      commandTimeout: 2_000,
    });
    this.client.on("error", (err) => this.logger.error(`Redis error: ${err.message}`));
    this.client.on("connect", () => this.logger.log("Redis connected"));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /** Increment a counter with TTL. Returns new count. Needs Redis 7+ (EXPIRE ... NX). */
  async incrWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const pipeline = this.client.multi();
    pipeline.incr(key);
    pipeline.expire(key, ttlSeconds, "NX");
    const res = await pipeline.exec();
    return Number(res?.[0]?.[1] ?? 0);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.client.set(key, value, "EX", ttlSeconds);
  }

  /** Set only if the key does not exist. Returns true if it was set. */
  async setNx(key: string, ttlSeconds: number, value: string): Promise<boolean> {
    const res = await this.client.set(key, value, "EX", ttlSeconds, "NX");
    return res === "OK";
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === "PONG";
    } catch {
      return false;
    }
  }
}
