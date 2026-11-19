import { Injectable, Logger } from "@nestjs/common";
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

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(ctx: AuditContext): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: ctx.actorId ?? null,
          actorName: ctx.actorName ?? null,
          action: ctx.action,
          target: ctx.target ?? null,
          ip: ctx.ip ?? null,
          userAgent: ctx.userAgent ?? null,
          metadata: (ctx.metadata as object | undefined) ?? undefined,
        },
      });
    } catch (err) {
      // Audit failure must never crash the request
      this.logger.error(`Audit write failed: ${(err as Error).message}`);
    }
  }
}
