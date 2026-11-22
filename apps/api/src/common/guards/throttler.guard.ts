import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

/**
 * Rate limits are counted per client IP.
 *
 * `req.ip` is worked out by Express from the "trust proxy" setting in main.ts
 * (TRUST_PROXY_HOPS). Do NOT read X-Forwarded-For here: its first value is
 * supplied by the caller and can be faked to dodge the limits.
 */
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    return Promise.resolve((req.ip as string | undefined) ?? "unknown");
  }
}
