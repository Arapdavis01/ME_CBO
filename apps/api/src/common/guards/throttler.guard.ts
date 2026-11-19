import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    const forwarded = (req.headers as Record<string, string | string[] | undefined>)?.[
      "x-forwarded-for"
    ];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ??
      (req.ip as string | undefined) ??
      "unknown";
    return Promise.resolve(ip);
  }
}
