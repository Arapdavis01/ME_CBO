// apps/web/src/lib/public/public.api.ts
/**
 * Server-side reads of the public website content.
 * Pages using this are re-generated at most once a minute, so what admins
 * change in the dashboard appears on the website within about a minute.
 * If the API is asleep or unreachable the helpers return empty results
 * instead of breaking the page.
 */
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

const API = process.env.API_URL ?? "http://localhost:4000/api/v1";

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getPublicEvents(): Promise<{ upcoming: PublicEvent[]; past: PublicEvent[] }> {
  return (await get<{ upcoming: PublicEvent[]; past: PublicEvent[] }>("/public/events")) ?? {
    upcoming: [],
    past: [],
  };
}

export async function getPublicEvent(id: string): Promise<PublicEvent | null> {
  return (await get<{ event: PublicEvent }>(`/public/events/${id}`))?.event ?? null;
}

export async function getPublicProjects(): Promise<PublicProject[]> {
  return (await get<{ items: PublicProject[] }>("/public/projects"))?.items ?? [];
}

export async function getPublicProject(slug: string): Promise<PublicProject | null> {
  return (await get<{ project: PublicProject }>(`/public/projects/${slug}`))?.project ?? null;
}
