"use client";

import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Incident } from "@/types/incidents";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const sev: Record<Incident["severity"], "neutral" | "warning" | "danger"> = {
  LOW: "neutral",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger",
};

const cat: Record<Incident["category"], string> = {
  ILLEGAL_DUMPING: "Illegal dumping",
  DEFORESTATION: "Deforestation",
  WATER_POLLUTION: "Water pollution",
  AIR_POLLUTION: "Air pollution",
  WILDLIFE: "Wildlife",
  OTHER: "Other",
};

export function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Link
      href={`/incidents/${incident.id}`}
      className="block rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3 transition hover:shadow-geo focus-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--fg)]">
            {incident.title}
          </p>
          <p className="text-xs text-[var(--fg-subtle)]">{cat[incident.category]}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Badge tone={sev[incident.severity]}>{incident.severity.toLowerCase()}</Badge>
          <Badge tone={incident.status === "RESOLVED" ? "success" : incident.status === "OPEN" ? "warning" : "neutral"}>
            {incident.status.toLowerCase()}
          </Badge>
        </div>
      </div>
      <p className="mt-1 clamp-2 text-xs text-[var(--fg-muted)]">
        {incident.description}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--fg-subtle)]">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" aria-hidden /> {incident.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          {formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true })}
        </span>
      </div>
    </Link>
  );
}
