"use client";

import { useMemo, useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { Card, CardBody } from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const filters = ["All", "CLEANUP", "PLANTING", "AWARENESS", "MEETING"] as const;
type Filter = (typeof filters)[number];

export default function EventsPage() {
  const { data, isLoading } = useEvents();
  const [filter, setFilter] = useState<Filter>("All");

  const items = useMemo(() => {
    if (!data) return [];
    return filter === "All" ? data : data.filter((e) => e.category === filter);
  }, [data, filter]);

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[var(--fg)]">Events</h1>
          <p className="text-sm text-[var(--fg-muted)]">Join a field activity near you.</p>
        </div>
      </div>

      {/* Horizontally scrollable filter chips — mobile-friendly */}
      <div className="mb-4 -mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-ring min-h-[36px]",
                filter === f
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-muted)]",
              )}
            >
              {f === "All" ? "All" : f.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16 text-[var(--fg-muted)]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">
            No events match this filter yet.
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
