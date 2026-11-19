"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { EventItem } from "@/types/events";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const categoryTone: Record<EventItem["category"], string> = {
  CLEANUP: "bg-[var(--me-forest-50,#f0fdf4)] text-[var(--me-forest)]",
  PLANTING: "bg-[var(--me-sand)] text-[var(--me-earth)]",
  AWARENESS: "bg-[var(--bg-muted)] text-[var(--fg)]",
  MEETING: "bg-[var(--bg-muted)] text-[var(--fg)]",
};

export function EventCard({ event }: { event: EventItem }) {
  const full = event.attending >= event.capacity;
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-sm transition hover:shadow-geo focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
            categoryTone[event.category],
          )}
        >
          {event.category.toLowerCase()}
        </span>
        {event.myRsvp === "GOING" && (
          <Badge tone="success">Going</Badge>
        )}
      </div>
      <h3 className="mt-2 clamp-2 text-base font-semibold text-[var(--fg)]">
        {event.title}
      </h3>
      <p className="mt-1 clamp-2 text-sm text-[var(--fg-muted)]">
        {event.description}
      </p>
      <div className="mt-3 grid gap-1 text-xs text-[var(--fg-subtle)]">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden /> {formatDate(event.startsAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> {event.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" aria-hidden />
          {event.attending}/{event.capacity} {full && "· Full"}
        </span>
      </div>
    </Link>
  );
}
