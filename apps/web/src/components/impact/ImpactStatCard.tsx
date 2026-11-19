import { cn } from "@/lib/utils";

export function ImpactStatCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = "forest",
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "forest" | "leaf" | "earth" | "sky";
}) {
  const tones = {
    forest: "bg-[var(--primary)] text-[var(--primary-fg)]",
    leaf: "bg-[var(--accent)] text-[var(--accent-fg)]",
    earth: "bg-[var(--warning)] text-white",
    sky: "bg-[#0ea5e9] text-white",
  } as const;

  return (
    <div className="rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-subtle)]">
          {label}
        </p>
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full",
            tones[tone],
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 flex items-baseline gap-1 text-2xl font-bold text-[var(--fg)]">
        {value}
        {unit && (
          <span className="text-sm font-medium text-[var(--fg-subtle)]">{unit}</span>
        )}
      </p>
      {hint && <p className="mt-0.5 text-xs text-[var(--fg-subtle)]">{hint}</p>}
    </div>
  );
}
