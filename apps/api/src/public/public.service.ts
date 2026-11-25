import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type PublicEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  startsAt: string;
  endsAt: string;
  status: "PUBLISHED" | "ONGOING" | "COMPLETED";
  category: "CLEANUP" | "PLANTING" | "AWARENESS" | "MEETING";
  capacity: number;
  coverImageUrl: string | null;
};

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  phase: "PLANNED" | "ONGOING" | "COMPLETED";
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  coverImageUrl: string | null;
  highlights: string[];
  publishedAt: string | null;
};

const TTL_MS = 30_000;
const NOTICE_TTL_MS = 10_000;

export type PublicAnnouncement = {
  id: string;
  kind: "INFO" | "MAINTENANCE" | "WARNING";
  message: string;
  windowStart: string | null;
  windowEnd: string | null;
  updatedAt: string;
};

/**
 * Read-only data for the public website. Only published content leaves here,
 * and only fields that are safe for anyone to see (no check-in codes, no
 * member or admin details). Results are cached for 30 seconds so a busy
 * website cannot overload the database.
 */
@Injectable()
export class PublicService {
  private readonly cache = new Map<string, { at: number; value: unknown }>();

  constructor(private readonly prisma: PrismaService) {}

  private async cached<T>(key: string, load: () => Promise<T>, ttl = TTL_MS): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < ttl) return hit.value as T;
    const value = await load();
    this.cache.set(key, { at: Date.now(), value });
    return value;
  }

  /** The notice currently shown in the site banner, or null. */
  announcement(): Promise<PublicAnnouncement | null> {
    return this.cached(
      "announcement",
      async () => {
        const now = new Date();
        const row = await this.prisma.announcement.findFirst({
          where: {
            active: true,
            showFrom: { lte: now },
            OR: [{ windowEnd: null }, { windowEnd: { gte: now } }],
          },
          orderBy: { showFrom: "desc" },
        });
        return row
          ? {
              id: row.id,
              kind: row.kind,
              message: row.message,
              windowStart: row.windowStart?.toISOString() ?? null,
              windowEnd: row.windowEnd?.toISOString() ?? null,
              updatedAt: row.updatedAt.toISOString(),
            }
          : null;
      },
      NOTICE_TTL_MS,
    );
  }

  /** Upcoming and ongoing events, plus the most recent completed ones. */
  events(): Promise<{ upcoming: PublicEvent[]; past: PublicEvent[] }> {
    return this.cached("events", async () => {
      const now = new Date();
      const select = {
        id: true, title: true, description: true, location: true, lat: true, lng: true,
        startsAt: true, endsAt: true, status: true, category: true, capacity: true,
        coverImageUrl: true,
      } as const;

      const [upcoming, past] = await Promise.all([
        this.prisma.event.findMany({
          where: { status: { in: ["PUBLISHED", "ONGOING"] }, endsAt: { gte: now } },
          orderBy: { startsAt: "asc" },
          take: 50,
          select,
        }),
        this.prisma.event.findMany({
          where: {
            OR: [
              { status: "COMPLETED" },
              { status: { in: ["PUBLISHED", "ONGOING"] }, endsAt: { lt: now } },
            ],
          },
          orderBy: { startsAt: "desc" },
          take: 12,
          select,
        }),
      ]);
      return { upcoming: upcoming.map(mapEvent), past: past.map(mapEvent) };
    });
  }

  async event(id: string): Promise<PublicEvent | null> {
    const row = await this.prisma.event.findFirst({
      where: { id, status: { in: ["PUBLISHED", "ONGOING", "COMPLETED"] } },
      select: {
        id: true, title: true, description: true, location: true, lat: true, lng: true,
        startsAt: true, endsAt: true, status: true, category: true, capacity: true,
        coverImageUrl: true,
      },
    });
    return row ? mapEvent(row) : null;
  }

  projects(): Promise<PublicProject[]> {
    return this.cached("projects", async () => {
      const rows = await this.prisma.project.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ publishedAt: "desc" }],
        take: 100,
      });
      const order = { ONGOING: 0, PLANNED: 1, COMPLETED: 2 } as const;
      return rows.map(mapProject).sort((a, b) => order[a.phase] - order[b.phase]);
    });
  }

  async project(slug: string): Promise<PublicProject | null> {
    const row = await this.prisma.project.findFirst({
      where: { slug, status: "PUBLISHED" },
    });
    return row ? mapProject(row) : null;
  }
}

type EventRow = {
  id: string; title: string; description: string; location: string;
  lat: number; lng: number; startsAt: Date; endsAt: Date;
  status: string; category: string; capacity: number; coverImageUrl: string | null;
};

function mapEvent(e: EventRow): PublicEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    lat: e.lat,
    lng: e.lng,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt.toISOString(),
    status: e.status as PublicEvent["status"],
    category: e.category as PublicEvent["category"],
    capacity: e.capacity,
    coverImageUrl: e.coverImageUrl,
  };
}

function mapProject(p: {
  id: string; slug: string; title: string; summary: string; description: string;
  phase: string; location: string | null; startDate: Date | null; endDate: Date | null;
  coverImageUrl: string | null; highlights: string[]; publishedAt: Date | null;
}): PublicProject {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    description: p.description,
    phase: p.phase as PublicProject["phase"],
    location: p.location,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    coverImageUrl: p.coverImageUrl,
    highlights: p.highlights,
    publishedAt: p.publishedAt?.toISOString() ?? null,
  };
}
