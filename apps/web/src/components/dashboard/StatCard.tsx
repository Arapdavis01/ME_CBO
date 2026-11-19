import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "forest",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "forest" | "leaf" | "earth";
}) {
  const tones = {
    forest: "bg-[var(--primary)] text-[var(--primary-fg)]",
    leaf: "bg-[var(--accent)] text-[var(--accent-fg)]",
    earth: "bg-[var(--warning)] text-white",
  } as const;

  return (
    <div className="rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-subtle)]">
          {label}
        </p>
        <span className={cn("grid h-9 w-9 place-items-center rounded-full", tones[tone])}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-[var(--fg)]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--fg-subtle)]">{hint}</p>}
    </div>
  );
}
