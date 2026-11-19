"use client";

import { Sprout, Leaf, TreePine, Recycle, Droplet, Sun, Star } from "lucide-react";
import type { Badge } from "@/types/impact";
import { cn } from "@/lib/utils";

const icons = {
  sprout: Sprout,
  leaf: Leaf,
  tree: TreePine,
  recycle: Recycle,
  droplet: Droplet,
  sun: Sun,
  star: Star,
} as const;

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 xs:grid-cols-3 sm:grid-cols-4">
      {badges.map((b) => {
        const Icon = icons[b.icon];
        const pct = Math.min(100, Math.round((b.progress.current / b.progress.target) * 100));
        return (
          <div
            key={b.id}
            className={cn(
              "flex flex-col items-center gap-2 rounded-card border p-3 text-center",
              b.earned
                ? "border-[var(--accent)] bg-[color:var(--accent)]/10"
                : "border-[var(--border)] bg-[var(--bg-elevated)]",
            )}
          >
            <span
              className={cn(
                "grid h-12 w-12 place-items-center rounded-full",
                b.earned
                  ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                  : "bg-[var(--bg-muted)] text-[var(--fg-subtle)]",
              )}
            >
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <p
              className={cn(
                "text-xs font-semibold",
                b.earned ? "text-[var(--fg)]" : "text-[var(--fg-muted)]",
              )}
            >
              {b.name}
            </p>
            {b.earned ? (
              <span className="text-[10px] font-medium text-[var(--success)]">
                Earned
              </span>
            ) : (
              <div className="w-full">
                <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                </div>
                <span className="mt-1 block text-[10px] text-[var(--fg-subtle)]">
                  {b.progress.current}/{b.progress.target}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
