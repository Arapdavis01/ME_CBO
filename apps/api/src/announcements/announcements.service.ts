import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Announcement } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import type {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from "./dto/announcements.dto";

export type AnnouncementResponse = {
  id: string;
  kind: Announcement["kind"];
  message: string;
  showFrom: string;
  windowStart: string | null;
  windowEnd: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(): Promise<AnnouncementResponse[]> {
    const rows = await this.prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map(toResponse);
  }

  async create(dto: CreateAnnouncementDto, actorId: string): Promise<AnnouncementResponse> {
    this.assertWindow(dto.windowStart, dto.windowEnd);
    const row = await this.prisma.announcement.create({
      data: {
        message: dto.message,
        kind: dto.kind ?? "INFO",
        showFrom: dto.showFrom ? new Date(dto.showFrom) : new Date(),
        windowStart: dto.windowStart ? new Date(dto.windowStart) : null,
        windowEnd: dto.windowEnd ? new Date(dto.windowEnd) : null,
        active: dto.active ?? true,
        createdById: actorId,
      },
    });
    void this.audit.record({
      actorId,
      action: "announcements.create",
      target: row.id,
      metadata: { kind: row.kind },
    });
    return toResponse(row);
  }

  async update(id: string, dto: UpdateAnnouncementDto, actorId: string): Promise<AnnouncementResponse> {
    const current = await this.prisma.announcement.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Notice not found");
    this.assertWindow(
      dto.windowStart ?? current.windowStart?.toISOString(),
      dto.windowEnd ?? current.windowEnd?.toISOString(),
    );
    const row = await this.prisma.announcement.update({
      where: { id },
      data: {
        ...(dto.message !== undefined && { message: dto.message }),
        ...(dto.kind !== undefined && { kind: dto.kind }),
        ...(dto.showFrom !== undefined && { showFrom: new Date(dto.showFrom) }),
        ...(dto.windowStart !== undefined && { windowStart: new Date(dto.windowStart) }),
        ...(dto.windowEnd !== undefined && { windowEnd: new Date(dto.windowEnd) }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });
    void this.audit.record({
      actorId,
      action: "announcements.update",
      target: id,
      metadata: { fields: Object.keys(dto), active: row.active },
    });
    return toResponse(row);
  }

  async remove(id: string, actorId: string): Promise<{ ok: true }> {
    const row = await this.prisma.announcement.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Notice not found");
    await this.prisma.announcement.delete({ where: { id } });
    void this.audit.record({ actorId, action: "announcements.delete", target: id });
    return { ok: true };
  }

  private assertWindow(start?: string, end?: string) {
    if (start && end && new Date(end) <= new Date(start)) {
      throw new BadRequestException("The end time must be after the start time");
    }
  }
}

export function toResponse(a: Announcement): AnnouncementResponse {
  return {
    id: a.id,
    kind: a.kind,
    message: a.message,
    showFrom: a.showFrom.toISOString(),
    windowStart: a.windowStart?.toISOString() ?? null,
    windowEnd: a.windowEnd?.toISOString() ?? null,
    active: a.active,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
