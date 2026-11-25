// apps/web/src/lib/public/format.ts
const TZ = "Africa/Nairobi";

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: TZ,
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "numeric", minute: "2-digit", timeZone: TZ,
  });
}

export function formatRange(startIso: string, endIso: string): string {
  return `${formatDay(startIso)}, ${formatTime(startIso)} – ${formatTime(endIso)}`;
}

export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", { month: "long", year: "numeric", timeZone: TZ });
}

export const CATEGORY_LABELS = {
  CLEANUP: "Clean-up",
  PLANTING: "Tree planting",
  AWARENESS: "Awareness",
  MEETING: "Meeting",
} as const;

export const PHASE_LABELS = {
  PLANNED: "Planned",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
} as const;

/** Splits a long text into paragraphs at blank lines. */
export function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
