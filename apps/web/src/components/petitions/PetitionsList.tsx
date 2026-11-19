"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { petitionsApi } from "@/lib/api/petitions.api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function PetitionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["petitions"],
    queryFn: async () => (await petitionsApi.list()).items,
  });

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  }
  if (!data || data.length === 0) {
    return <p className="py-10 text-center text-sm text-[var(--fg-muted)]">No open petitions yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {data.map((p) => {
        const pct = Math.min(100, Math.round((p.currentSignatures / p.goalSignatures) * 100));
        return (
          <li key={p.id}>
            <Link
              href={`/petitions/${p.slug}`}
              className="block rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition hover:shadow-geo focus-ring"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--fg)]">{p.title}</p>
                  <p className="text-xs text-[var(--fg-subtle)]">To: {p.target}</p>
                </div>
                <Badge tone={p.status === "OPEN" ? "success" : "neutral"}>{p.status.toLowerCase()}</Badge>
              </div>
              <p className="mt-1 clamp-2 text-xs text-[var(--fg-muted)]">{p.summary}</p>
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
                  <div className={cn("h-full", p.status === "OPEN" ? "bg-[var(--accent)]" : "bg-[var(--fg-subtle)]")} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-[var(--fg-subtle)]">
                  {p.currentSignatures.toLocaleString()} / {p.goalSignatures.toLocaleString()} signatures
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
