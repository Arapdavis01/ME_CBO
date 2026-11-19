"use client";

import { cn } from "@/lib/utils";

const rules = [
  { label: "At least 12 characters", test: (v: string) => v.length >= 12 },
  { label: "Upper & lowercase", test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "A number", test: (v: string) => /\d/.test(v) },
  { label: "A symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function PasswordStrengthMeter({ value }: { value: string }) {
  const passed = rules.filter((r) => r.test(value)).length;
  const pct = (passed / rules.length) * 100;
  const tone =
    passed <= 1
      ? "bg-[var(--danger)]"
      : passed === 2
        ? "bg-[var(--warning)]"
        : passed === 3
          ? "bg-[var(--me-earth-400)]"
          : "bg-[var(--success)]";

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
        <div
          className={cn("h-full transition-all duration-300", tone)}
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <ul className="mt-2 grid grid-cols-1 gap-1 text-xs xs:grid-cols-2">
        {rules.map((r) => {
          const ok = r.test(value);
          return (
            <li
              key={r.label}
              className={cn(
                "flex items-center gap-1.5",
                ok ? "text-[var(--success)]" : "text-[var(--fg-subtle)]",
              )}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
