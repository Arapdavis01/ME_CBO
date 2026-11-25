// apps/web/src/components/public/EventCard.tsx
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { PublicEvent } from "@/lib/public/public.api";
import { CATEGORY_LABELS, formatRange } from "@/lib/public/format";

export function EventCard({ event }: { event: PublicEvent }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {event.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.coverImageUrl} alt="" loading="lazy" className="h-40 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
          {CATEGORY_LABELS[event.category]}
          {event.status === "ONGOING" ? " · Happening now" : ""}
        </span>
        <h3 className="mt-3 text-[var(--fg)]">
          <Link href={`/community-events/${event.id}`} className="hover:underline">
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 flex items-start gap-2 text-sm text-[var(--fg-muted)]">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {formatRange(event.startsAt, event.endsAt)}
        </p>
        <p className="mt-1 flex items-start gap-2 text-sm text-[var(--fg-muted)]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {event.location}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm text-[var(--fg-muted)]">{event.description}</p>
        <Link
          href={`/community-events/${event.id}`}
          className="mt-4 text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Details
        </Link>
      </div>
    </Card>
  );
}
