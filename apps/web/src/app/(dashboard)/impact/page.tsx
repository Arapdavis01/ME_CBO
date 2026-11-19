"use client";

import Link from "next/link";
import { useState } from "react";
import {
  TreePine,
  Recycle,
  Clock,
  CalendarDays,
  Cloud,
  Users,
  Leaf,
} from "lucide-react";
import { useMyImpact, useClubImpact, useImpactHistory, useBadges } from "@/hooks/useImpact";
import { useAuth } from "@/hooks/useAuth";
import { ImpactStatCard } from "@/components/impact/ImpactStatCard";
import { ImpactBarChart } from "@/components/impact/ImpactBarChart";
import { BadgeGrid } from "@/components/impact/BadgeGrid";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ImpactPage() {
  const { user } = useAuth();
  const { data: mine, isLoading: loadingMine } = useMyImpact();
  const { data: club } = useClubImpact();
  const { data: history } = useImpactHistory(6);
  const { data: badges } = useBadges();
  const [series, setSeries] = useState<"trees" | "wasteKg" | "hours">("trees");

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="mb-5">
        <h1 className="text-[var(--fg)]">My impact</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          {user?.fullName?.split(" ")[0] ?? "Your"} contribution to Mosoriot.
        </p>
      </div>

      {loadingMine || !mine ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ImpactStatCard label="Trees" value={mine.treesPlanted} icon={TreePine} hint="Lifetime" />
          <ImpactStatCard label="Waste" value={mine.wasteCollectedKg} unit="kg" icon={Recycle} tone="leaf" />
          <ImpactStatCard label="Hours" value={mine.volunteerHours} icon={Clock} tone="earth" />
          <ImpactStatCard label="Events" value={mine.eventsAttended} icon={CalendarDays} tone="sky" />
        </div>
      )}

      <div className="mt-3 rounded-card border border-[var(--border)] bg-[color:var(--accent)]/10 p-4">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-[var(--accent)]" aria-hidden />
          <p className="text-sm font-semibold text-[var(--fg)]">
            Carbon offset: {mine?.carbonOffsetKg ?? 0} kg CO₂e
          </p>
        </div>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">
          Estimated from your tree planting and waste diversion. Updated monthly.
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Trend</CardTitle>
          <div className="flex gap-1">
            {(["trees", "wasteKg", "hours"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeries(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-ring min-h-[32px] ${
                  series === s
                    ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                    : "bg-[var(--bg-muted)] text-[var(--fg-muted)]"
                }`}
              >
                {s === "trees" ? "Trees" : s === "wasteKg" ? "Waste" : "Hours"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          {history && history.length > 0 ? (
            <ImpactBarChart data={history} series={series} />
          ) : (
            <p className="py-6 text-center text-sm text-[var(--fg-muted)]">
              Your first chart appears after your first logged event.
            </p>
          )}
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardBody>
          {badges && badges.length > 0 ? (
            <BadgeGrid badges={badges} />
          ) : (
            <p className="py-6 text-center text-sm text-[var(--fg-muted)]">
              Log your first event to unlock your first badge.
            </p>
          )}
        </CardBody>
      </Card>

      {club && (
        <Card className="mt-4">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Club impact</CardTitle>
            <Leaf className="h-4 w-4 text-[var(--primary)]" aria-hidden />
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="Active members" value={club.activeMembers} icon={Users} />
            <Stat label="Trees planted" value={club.treesPlanted} icon={TreePine} />
            <Stat label="Waste (kg)" value={club.wasteCollectedKg} icon={Recycle} />
            <Stat label="Funds (KES)" value={club.fundsRaisedKes} icon={Cloud} />
          </CardBody>
        </Card>
      )}

      <div className="mt-6 grid gap-2 xs:grid-cols-2">
        <Link href="/impact/certificates">
          <Button fullWidth size="lg">My certificates</Button>
        </Link>
        <Link href="/events">
          <Button variant="outline" fullWidth size="lg">Log new impact</Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-3">
      <Icon className="h-4 w-4 text-[var(--primary)]" aria-hidden />
      <p className="mt-1 text-lg font-bold text-[var(--fg)]">{value.toLocaleString()}</p>
      <p className="text-[11px] text-[var(--fg-subtle)]">{label}</p>
    </div>
  );
}
