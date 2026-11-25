import { Injectable, NotFoundException } from "@nestjs/common";
import type { Project } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import type { CreateProjectDto, UpdateProjectDto } from "./dto/projects.dto";

export type ProjectResponse = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: Project["status"];
  phase: Project["phase"];
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  coverImageUrl: string | null;
  highlights: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "project"
  );
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(): Promise<ProjectResponse[]> {
    const rows = await this.prisma.project.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
    });
    return rows.map(toResponse);
  }

  async get(id: string): Promise<ProjectResponse> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Project not found");
    return toResponse(row);
  }

  async create(dto: CreateProjectDto, actorId: string): Promise<ProjectResponse> {
    const status = dto.status ?? "DRAFT";
    const row = await this.prisma.project.create({
      data: {
        slug: await this.uniqueSlug(dto.title),
        title: dto.title,
        summary: dto.summary,
        description: dto.description,
        status,
        phase: dto.phase ?? "ONGOING",
        location: dto.location ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        coverImageUrl: dto.coverImageUrl ?? null,
        highlights: dto.highlights ?? [],
        createdById: actorId,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    void this.audit.record({
      actorId,
      action: "projects.create",
      target: row.id,
      metadata: { title: row.title, status: row.status },
    });
    return toResponse(row);
  }

  async update(id: string, dto: UpdateProjectDto, actorId: string): Promise<ProjectResponse> {
    const current = await this.prisma.project.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Project not found");

    const becomingPublished =
      dto.status === "PUBLISHED" && current.status !== "PUBLISHED";

    const row = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.phase !== undefined && { phase: dto.phase }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
        ...(dto.highlights !== undefined && { highlights: { set: dto.highlights } }),
        ...(becomingPublished ? { publishedAt: new Date() } : {}),
      },
    });
    void this.audit.record({
      actorId,
      action: "projects.update",
      target: id,
      metadata: { fields: Object.keys(dto), status: row.status },
    });
    return toResponse(row);
  }

  async remove(id: string, actorId: string): Promise<{ ok: true }> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Project not found");
    await this.prisma.project.delete({ where: { id } });
    void this.audit.record({
      actorId,
      action: "projects.delete",
      target: id,
      metadata: { title: row.title },
    });
    return { ok: true };
  }

  private async uniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    for (let i = 0; i < 20; i++) {
      const candidate = i === 0 ? base : `${base}-${i + 1}`;
      const taken = await this.prisma.project.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!taken) return candidate;
    }
    return `${base}-${Date.now().toString(36)}`;
  }
}

export function toResponse(p: Project): ProjectResponse {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    description: p.description,
    status: p.status,
    phase: p.phase,
    location: p.location,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    coverImageUrl: p.coverImageUrl,
    highlights: p.highlights,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
