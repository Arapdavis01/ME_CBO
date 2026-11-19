"use client";

import { useState } from "react";
import Link from "next/link";
import { useAllDonations } from "@/hooks/useFinance";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/finance/StatusBadge";
import { formatKes } from "@/lib/format";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "SUCCEEDED" | "PENDING" | "FAILED";

export default function DonationsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data, isLoading } = useAllDonations(filter === "ALL" ? undefined : filter);

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link href="/finance" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">
        ← Finance
      </Link>
      <h1 className="mt-2 text-[var(--fg)]">Donations</h1>

      <div className="mt-3 -mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {(["ALL", "SUCCEEDED", "PENDING", "FAILED"] as const).map((f) => (
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
        <Card className="mt-4"><CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">No donations in this filter.</CardBody></Card>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((d) => (
            <li key={d.id} className="rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--fg)]">
                    {d.isAnonymous ? "Anonymous donor" : d.donorName}
                  </p>
                  <p className="text-xs text-[var(--fg-subtle)]">
                    {d.method.toLowerCase()} · {formatDate(d.createdAt)}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-base font-bold text-[var(--fg)]">{formatKes(d.amountKes)}</p>
                {d.receiptUrl && (
                  <a href={d.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--primary)]">
                    Receipt
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
