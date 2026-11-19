"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatKes } from "@/lib/format";

export interface AmountInputProps {
  value: number;
  onChange: (n: number) => void;
  presets?: number[];
  min?: number;
  max?: number;
  label?: string;
  error?: string;
}

export function AmountInput({
  value,
  onChange,
  presets = [100, 500, 1000, 5000],
  min = 10,
  max = 500_000,
  label = "Amount (KES)",
  error,
}: AmountInputProps) {
  const [raw, setRaw] = React.useState(String(value || ""));

  const commit = (next: string) => {
    const cleaned = next.replace(/[^\d]/g, "");
    const n = Number(cleaned || 0);
    setRaw(cleaned);
    onChange(n);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{label}</label>
      <div
        className={cn(
          "flex min-h-[52px] items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--bg-elevated)] px-3 focus-within:border-[var(--accent)] focus-ring",
          error ? "border-[var(--danger)]" : "border-[var(--border)]",
        )}
      >
        <span className="text-sm font-semibold text-[var(--fg-subtle)]">KES</span>
        <input
          inputMode="numeric"
          autoComplete="off"
          value={raw}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => {
            if (value > 0 && value < min) commit(String(min));
            if (value > max) commit(String(max));
          }}
          aria-label="Donation amount in Kenyan shillings"
          className="min-w-0 flex-1 bg-transparent py-3 text-[18px] font-semibold text-[var(--fg)] outline-none"
          placeholder="0"
        />
        <span className="text-xs text-[var(--fg-subtle)]">{formatKes(value || 0)}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => commit(String(p))}
            className={cn(
              "min-h-[36px] rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-ring",
              value === p
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                : "border-[var(--border)] text-[var(--fg-muted)] hover:bg-[var(--bg-muted)]",
            )}
          >
            {formatKes(p)}
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
