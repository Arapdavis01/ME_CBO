"use client";

import Link from "next/link";
import { useState } from "react";
import { useAllInvoices } from "@/hooks/useFinance";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/finance/StatusBadge";
import { formatKes } from "@/lib/format";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "PAID" | "DUE" | "OVERDUE";

export default function DuesPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data, isLoading } = useAllInvoices(filter === "ALL" ? undefined : filter);

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link href="/finance" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">
        ← Finance
      </Link>
      <h1 className="mt-2 text-[var(--fg)]">Member dues</h1>

      <div className="mt-3 -mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {(["ALL", "PAID", "DUE", "OVERDUE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium focus-ring min-h-[36px]",
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
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4"><CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">No invoices in this filter.</CardBody></Card>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((inv) => (
            <li key={inv.id} className="rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--fg)]">{inv.memberName}</p>
                  <p className="text-xs text-[var(--fg-subtle)]">
                    {inv.planName} · {inv.periodLabel}
                  </p>
                  <p className="mt-1 text-xs text-[var(--fg-subtle)]">
                    Due {formatDate(inv.dueDate)}
                  </p>
                </div>
                <StatusBadge status={inv.status} />
              </div>
              <p className="mt-1 text-base font-bold text-[var(--fg)]">{formatKes(inv.amountKes)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
