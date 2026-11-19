"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useExpenses, useApproveExpense, useRejectExpense } from "@/hooks/useFinance";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/finance/StatusBadge";
import { formatKes } from "@/lib/format";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "PAID";

export default function ExpensesPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const { data, isLoading } = useExpenses(filter === "ALL" ? undefined : filter);
  const approve = useApproveExpense();
  const reject = useRejectExpense();
  const { can } = usePermissions();

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link href="/finance" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">
        ← Finance
      </Link>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="text-[var(--fg)]">Expenses</h1>
        <Link href="/finance/expenses/new">
          <Button size="sm"><Plus className="h-4 w-4" /> New</Button>
        </Link>
      </div>

      <div className="mt-3 -mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {(["ALL", "PENDING", "APPROVED", "REJECTED", "PAID"] as const).map((f) => (
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
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4"><CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">No expenses in this filter.</CardBody></Card>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((e) => (
            <li key={e.id} className="rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--fg)]">{e.description}</p>
                  <p className="text-xs text-[var(--fg-subtle)]">
                    {e.category.toLowerCase()} · {e.paidTo} · {formatDate(e.requestedAt)}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <p className="mt-1 text-base font-bold text-[var(--fg)]">{formatKes(e.amountKes)}</p>

              {can("finance:approve") && e.status === "PENDING" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const reason = window.prompt("Reason for rejection?") ?? "";
                      if (reason.trim()) reject.mutate({ id: e.id, reason });
                    }}
                    loading={reject.isPending}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approve.mutate(e.id)}
                    loading={approve.isPending}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
