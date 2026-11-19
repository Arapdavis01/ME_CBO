"use client";

import type { ImpactHistory } from "@/types/impact";
import { cn } from "@/lib/utils";

type Series = "trees" | "wasteKg" | "hours";

const seriesMeta: Record<Series, { label: string; color: string; unit: string }> = {
  trees: { label: "Trees planted", color: "var(--primary)", unit: "" },
  wasteKg: { label: "Waste (kg)", color: "var(--accent)", unit: "kg" },
  hours: { label: "Hours", color: "var(--warning)", unit: "h" },
};

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function ImpactBarChart({
  data,
  series = "trees",
}: {
  data: ImpactHistory[];
  series?: Series;
}) {
  const meta = seriesMeta[series];
  const max = Math.max(1, ...data.map((d) => d[series]));
  const chartH = 160;

  return (
    <div role="img" aria-label={`${meta.label} over the last ${data.length} months`}>
      <div className="flex items-end justify-between gap-1.5 sm:gap-3" style={{ height: chartH }}>
        {data.map((d) => {
          const h = Math.round((d[series] / max) * (chartH - 24));
          const [year, monthNum] = d.month.split("-");
          const label = MONTHS_SHORT[Number(monthNum) - 1] ?? "";
          return (
            <div
              key={d.month}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <span className="text-[10px] font-semibold text-[var(--fg-muted)]">
                {d[series]}
              </span>
              <div
                className={cn(
                  "w-full max-w-[36px] rounded-t-md transition-all",
                  h > 0 ? "min-h-[4px]" : "",
                )}
                style={{
                  height: Math.max(4, h),
                  background: meta.color,
                  opacity: year === new Date().getFullYear().toString() ? 1 : 0.75,
                }}
              />
              <span className="text-[10px] text-[var(--fg-subtle)]">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--fg-subtle)]">
        <span>Last {data.length} months</span>
        <span>
          Peak: <strong className="text-[var(--fg)]">{max}{meta.unit}</strong>
        </span>
      </div>
    </div>
  );
}
