"use client";

import { Smartphone, CreditCard, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/types/finance";
import { cn } from "@/lib/utils";

const methods: Array<{ value: PaymentMethod; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: "MPESA", label: "M-Pesa", hint: "STK push to your phone", icon: Smartphone },
  { value: "CARD", label: "Card", hint: "Visa / Mastercard", icon: CreditCard },
  { value: "PAYPAL", label: "PayPal", hint: "International donors", icon: Wallet },
];

export function PaymentMethodPicker({
  value,
  onChange,
  allowed = ["MPESA", "CARD", "PAYPAL"],
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  allowed?: PaymentMethod[];
}) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid gap-2">
      {methods
        .filter((m) => allowed.includes(m.value))
        .map(({ value: v, label, hint, icon: Icon }) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(v)}
              className={cn(
                "flex min-h-[56px] items-center gap-3 rounded-[var(--radius-md)] border p-3 text-left transition-colors focus-ring",
                active
                  ? "border-[var(--primary)] bg-[color:var(--primary)]/5"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)]",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  active
                    ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                    : "bg-[var(--bg-muted)] text-[var(--fg-muted)]",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[var(--fg)]">{label}</span>
                <span className="block text-xs text-[var(--fg-subtle)]">{hint}</span>
              </span>
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full border-2",
                  active ? "border-[var(--primary)]" : "border-[var(--border-strong)]",
                )}
                aria-hidden
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />}
              </span>
            </button>
          );
        })}
    </div>
  );
}
