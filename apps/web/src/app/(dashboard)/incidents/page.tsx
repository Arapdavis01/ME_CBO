"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useIncidents } from "@/hooks/useIncidents";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const filters = ["ALL", "OPEN", "INVESTIGATING", "RESOLVED", "DISMISSED"] as const;
type Filter = (typeof filters)[number];

export default function IncidentsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data, isLoading } = useIncidents(filter === "ALL" ? undefined : filter);

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[var(--fg)]">Incidents</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Report and track environmental incidents across Mosoriot.
          </p>
        </div>
        <Link href="/incidents/new">
          <Button size="sm"><Plus className="h-4 w-4" /> Report</Button>
        </Link>
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-ring min-h-[36px]",
                filter === f
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-muted)]",
              )}
            >
              {f.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4"><CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">No incidents in this filter.</CardBody></Card>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((i) => <li key={i.id}><IncidentCard incident={i} /></li>)}
        </ul>
      )}
    </div>
  );
}
