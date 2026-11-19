import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import type {
  CertificateType,
  ImpactType,
  Prisma,
} from "@prisma/client";
import type {
  CreateImpactLogDto,
  IssueCertificateDto,
  ImpactMetricResponse,
  BadgeResponse,
  HistoryPointResponse,
  CertificateResponse,
} from "./dto/impact.dto";
import { randomBytes } from "node:crypto";

@Injectable()
export class ImpactService {
  private readonly logger = new Logger(ImpactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /* ─────────────────────────────────────────────────────────── */
  /*  Log impact (with badge auto-award)                        */
  /* ─────────────────────────────────────────────────────────── */
  async log(
    userId: string,
    actorId: string,
    dto: CreateImpactLogDto,
  ): Promise<{ logId: string; newBadges: BadgeResponse[] }> {
    const log = await this.prisma.impactLog.create({
      data: {
        userId,
        eventId: dto.eventId ?? null,
        type: dto.type,
        value: dto.value,
        notes: dto.notes ?? null,
        createdById: actorId,
      },
    });

    const newBadges = await this.evaluateBadges(userId);

    void this.audit.record({
      actorId,
      action: "impact.log",
      target: log.id,
      metadata: { userId, type: dto.type, value: dto.value },
    });

    return {
      logId: log.id,
      newBadges: newBadges.filter((b) => b.earned && b.earnedAt).map((b) => b),
    };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Personal metrics                                          */
  /* ─────────────────────────────────────────────────────────── */
  async myMetrics(userId: string): Promise<ImpactMetricResponse> {
    return this.metricsForUser(userId);
  }

  async metricsForUser(userId: string): Promise<ImpactMetricResponse> {
    const rows = await this.prisma.impactLog.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { value: true },
    });

    const map: Record<ImpactType, number> = {
      TREES_PLANTED: 0,
      WASTE_COLLECTED: 0,
      HOURS_VOLUNTEERED: 0,
      EVENT_ATTENDED: 0,
      CARBON_OFFSET: 0,
    };
    for (const r of rows) {
      map[r.type] = r._sum.value ?? 0;
    }

    return {
      treesPlanted: map.TREES_PLANTED,
      wasteCollectedKg: map.WASTE_COLLECTED,
      volunteerHours: map.HOURS_VOLUNTEERED,
      eventsAttended: map.EVENT_ATTENDED,
      carbonOffsetKg: map.CARBON_OFFSET,
    };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Club-wide metrics                                         */
  /* ─────────────────────────────────────────────────────────── */
  async clubMetrics() {
    const [rows, activeMembers, cleanupZones, reforestationSites, funds] =
      await Promise.all([
        this.prisma.impactLog.groupBy({
          by: ["type"],
          _sum: { value: true },
        }),
        this.prisma.user.count({ where: { status: "ACTIVE" } }),
        this.prisma.event.count({ where: { category: "CLEANUP" } }),
        this.prisma.event.count({ where: { category: "PLANTING" } }),
        // Funds placeholder — real number comes in B6 finance module
        Promise.resolve(0),
      ]);

    const map: Record<ImpactType, number> = {
      TREES_PLANTED: 0,
      WASTE_COLLECTED: 0,
      HOURS_VOLUNTEERED: 0,
      EVENT_ATTENDED: 0,
      CARBON_OFFSET: 0,
    };
    for (const r of rows) map[r.type] = r._sum.value ?? 0;

    return {
      treesPlanted: map.TREES_PLANTED,
      wasteCollectedKg: map.WASTE_COLLECTED,
      volunteerHours: map.HOURS_VOLUNTEERED,
      eventsAttended: map.EVENT_ATTENDED,
      carbonOffsetKg: map.CARBON_OFFSET,
      activeMembers,
      cleanupZones,
      reforestationSites,
      fundsRaisedKes: funds,
    };
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  History series (monthly rollups)                          */
  /* ─────────────────────────────────────────────────────────── */
  async history(userId: string, months: number): Promise<HistoryPointResponse[]> {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const logs = await this.prisma.impactLog.findMany({
      where: { userId, createdAt: { gte: from } },
      select: { type: true, value: true, createdAt: true },
    });

    // Build a dense map of every month in range
    const buckets = new Map<string, { trees: number; wasteKg: number; hours: number }>();
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, { trees: 0, wasteKg: 0, hours: 0 });
    }

    for (const l of logs) {
      const d = l.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const b = buckets.get(key);
      if (!b) continue;
      if (l.type === "TREES_PLANTED") b.trees += l.value;
      else if (l.type === "WASTE_COLLECTED") b.wasteKg += l.value;
      else if (l.type === "HOURS_VOLUNTEERED") b.hours += l.value;
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Badges                                                    */
  /* ─────────────────────────────────────────────────────────── */
  async badgesForUser(userId: string): Promise<BadgeResponse[]> {
    const [allBadges, awards, totals] = await Promise.all([
      this.prisma.badge.findMany({ orderBy: { targetValue: "asc" } }),
      this.prisma.userBadge.findMany({ where: { userId } }),
      this.prisma.impactLog.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { value: true },
      }),
    ]);

    const earnedMap = new Map(awards.map((a) => [a.badgeId, a.earnedAt]));
    const totalsMap: Record<ImpactType, number> = {
      TREES_PLANTED: 0,
      WASTE_COLLECTED: 0,
      HOURS_VOLUNTEERED: 0,
      EVENT_ATTENDED: 0,
      CARBON_OFFSET: 0,
    };
    for (const t of totals) totalsMap[t.type] = t._sum.value ?? 0;

    return allBadges.map((b) => {
      const earnedAt = earnedMap.get(b.id) ?? null;
      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        icon: b.icon,
        earned: earnedAt !== null,
        earnedAt: earnedAt ? earnedAt.toISOString() : null,
        progress: {
          current: Math.min(totalsMap[b.targetType], b.targetValue),
          target: b.targetValue,
        },
      };
    });
  }

  /**
   * After a new impact log, check if the user just crossed any badge
   * thresholds and award them.
   */
  private async evaluateBadges(userId: string): Promise<BadgeResponse[]> {
    const [allBadges, existingAwards, totals] = await Promise.all([
      this.prisma.badge.findMany(),
      this.prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      }),
      this.prisma.impactLog.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { value: true },
      }),
    ]);

    const earnedIds = new Set(existingAwards.map((a) => a.badgeId));
    const totalsMap: Record<ImpactType, number> = {
      TREES_PLANTED: 0,
      WASTE_COLLECTED: 0,
      HOURS_VOLUNTEERED: 0,
      EVENT_ATTENDED: 0,
      CARBON_OFFSET: 0,
    };
    for (const t of totals) totalsMap[t.type] = t._sum.value ?? 0;

    const newlyEarned = allBadges.filter(
      (b) => !earnedIds.has(b.id) && totalsMap[b.targetType] >= b.targetValue,
    );

    if (newlyEarned.length === 0) return this.badgesForUser(userId);

    await this.prisma.userBadge.createMany({
      data: newlyEarned.map((b) => ({ userId, badgeId: b.id })),
      skipDuplicates: true,
    });

    for (const b of newlyEarned) {
      void this.audit.record({
        actorId: userId,
        action: "impact.badge.earned",
        target: b.id,
        metadata: { slug: b.slug },
      });
    }

    return this.badgesForUser(userId);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Certificates                                              */
  /* ─────────────────────────────────────────────────────────── */
  async issueCertificate(
    userId: string,
    actorId: string,
    dto: IssueCertificateDto,
  ): Promise<CertificateResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const periodFrom = dto.periodFrom
      ? new Date(dto.periodFrom)
      : new Date(new Date().getFullYear(), 0, 1);
    const periodTo = dto.periodTo ? new Date(dto.periodTo) : new Date();

    if (periodTo <= periodFrom) {
      throw new BadRequestException("periodTo must be after periodFrom");
    }

    // Aggregate impact in that window
    const rows = await this.prisma.impactLog.groupBy({
      by: ["type"],
      where: { userId, createdAt: { gte: periodFrom, lte: periodTo } },
      _sum: { value: true },
    });
    const map: Record<ImpactType, number> = {
      TREES_PLANTED: 0,
      WASTE_COLLECTED: 0,
      HOURS_VOLUNTEERED: 0,
      EVENT_ATTENDED: 0,
      CARBON_OFFSET: 0,
    };
    for (const r of rows) map[r.type] = r._sum.value ?? 0;

    const title = this.certificateTitle(dto.type);
    const verificationCode = randomBytes(8).toString("hex").toUpperCase();

    const cert = await this.prisma.certificate.create({
      data: {
        userId,
        type: dto.type,
        title,
        periodFrom,
        periodTo,
        verificationCode,
        issuedById: actorId,
        treesPlanted: map.TREES_PLANTED,
        wasteCollectedKg: map.WASTE_COLLECTED,
        volunteerHours: map.HOURS_VOLUNTEERED,
        carbonOffsetKg: map.CARBON_OFFSET,
      },
    });

    void this.audit.record({
      actorId,
      action: "impact.certificate.issue",
      target: cert.id,
      metadata: { userId, type: dto.type },
    });

    return this.toCertificateResponse(cert, user.fullName);
  }

  async listCertificates(userId: string): Promise<CertificateResponse[]> {
    const [certs, user] = await Promise.all([
      this.prisma.certificate.findMany({
        where: { userId },
        orderBy: { issuedAt: "desc" },
      }),
      this.prisma.user.findUnique({ where: { id: userId } }),
    ]);
    if (!user) throw new NotFoundException("User not found");
    return certs.map((c) => this.toCertificateResponse(c, user.fullName));
  }

  async certificateDetail(userId: string, certId: string): Promise<CertificateResponse> {
    const cert = await this.prisma.certificate.findUnique({ where: { id: certId } });
    if (!cert) throw new NotFoundException("Certificate not found");
    if (cert.userId !== userId) throw new NotFoundException("Certificate not found");
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    return this.toCertificateResponse(cert, user.fullName);
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Helpers                                                   */
  /* ─────────────────────────────────────────────────────────── */
  private certificateTitle(type: CertificateType): string {
    const map: Record<CertificateType, string> = {
      VOLUNTEER_HOURS: "Certificate of Volunteer Service",
      TREES_PLANTED: "Certificate of Reforestation",
      WASTE_COLLECTED: "Certificate of Waste Diversion",
      ANNUAL_IMPACT: "Certificate of Annual Environmental Impact",
    };
    return map[type];
  }

  private toCertificateResponse(
    c: {
      id: string; type: CertificateType; title: string; issuedAt: Date;
      periodFrom: Date; periodTo: Date; verificationCode: string;
      treesPlanted: number; wasteCollectedKg: number; volunteerHours: number; carbonOffsetKg: number;
    },
    memberName: string,
  ): CertificateResponse {
    return {
      id: c.id,
      type: c.type,
      title: c.title,
      issuedAt: c.issuedAt.toISOString(),
      periodFrom: c.periodFrom.toISOString(),
      periodTo: c.periodTo.toISOString(),
      memberName,
      verificationCode: c.verificationCode,
      metrics: {
        treesPlanted: c.treesPlanted,
        wasteCollectedKg: c.wasteCollectedKg,
        volunteerHours: c.volunteerHours,
        eventsAttended: 0,
        carbonOffsetKg: c.carbonOffsetKg,
      },
    };
  }
}
