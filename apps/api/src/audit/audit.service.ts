import { Injectable, Logger } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type AuditContext = {
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  target?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AuditListQuery = {
  actorId?: string;
  /** Matches actions that start with this text, e.g. "auth." or "members.application". */
  action?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  cursor?: string;
};

const SENSITIVE_KEY = /pass|token|secret|code|hash|authorization|cookie/i;
const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clip(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Removes secrets and caps sizes so the audit table cannot be used to store junk. */
function clean(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return clip(value, 500);
  if (typeof value !== "object") return value;
  if (depth > 3) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => clean(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE_KEY.test(k) ? "[redacted]" : clean(v, depth + 1);
  }
  return out;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(ctx: AuditContext): Promise<void> {
    // Failed logins store the typed email; if it is not an email, it may be a password.
    let target = ctx.target ?? null;
    if (target !== null) {
      target =
        ctx.action.startsWith("auth.login.fail") && !EMAIL_LIKE.test(target)
          ? "[not-an-email]"
          : clip(target, 254);
    }

    const metadata = ctx.metadata ? (clean(ctx.metadata) as Prisma.InputJsonValue) : undefined;
    const row = {
      actorId: ctx.actorId ?? null,
      actorName: ctx.actorName ? clip(ctx.actorName, 120) : null,
      action: clip(ctx.action, 120),
      target,
      ip: ctx.ip ? clip(ctx.ip, 64) : null,
      userAgent: ctx.userAgent ? clip(ctx.userAgent, 300) : null,
      metadata,
    };

    try {
      await this.prisma.auditLog.create({ data: row });
    } catch (err) {
      // Audit failure must never crash the request, but keep the event in the logs.
      this.logger.error(`Audit write failed: ${(err as Error).message}`);
      this.logger.error(`AUDIT_FALLBACK ${JSON.stringify(row)}`);
    }
  }

  /** Newest first, with cursor pagination. */
  async list(q: AuditListQuery = {}) {
    const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
    const where: Prisma.AuditLogWhereInput = {
      ...(q.actorId ? { actorId: q.actorId } : {}),
      ...(q.action ? { action: { startsWith: q.action } } : {}),
      ...(q.from || q.to
        ? {
            createdAt: {
              ...(q.from ? { gte: q.from } : {}),
              ...(q.to ? { lte: q.to } : {}),
            },
          }
        : {}),
    };

    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    };
  }
}
