"use client";

import Link from "next/link";
import { Wallet, TrendingUp, Receipt, Heart, AlertTriangle } from "lucide-react";
import { useFinanceSummary, useExpenses } from "@/hooks/useFinance";
import { usePermissions } from "@/hooks/usePermissions";
import { ImpactStatCard } from "@/components/impact/ImpactStatCard";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/finance/StatusBadge";
import { formatKesShort, formatKes } from "@/lib/format";
import { formatDate } from "@/lib/utils";

export default function FinancePage() {
  const { can } = usePermissions();
  const { data: summary, isLoading } = useFinanceSummary();
  const { data: pending } = useExpenses("PENDING");

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">Finance</h1>
      <p className="mt-1 text-sm text-[var(--fg-muted)]">
        Donations, dues, expenses, and balance.
      </p>

      {isLoading || !summary ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ImpactStatCard label="Balance" value={formatKesShort(summary.balanceKes)} icon={Wallet} />
          <ImpactStatCard label="Donations" value={formatKesShort(summary.totalDonationsKes)} icon={Heart} tone="leaf" />
          <ImpactStatCard label="Dues" value={formatKesShort(summary.totalDuesKes)} icon={Receipt} tone="sky" />
          <ImpactStatCard label="Expenses" value={formatKesShort(summary.totalExpensesKes)} icon={TrendingUp} tone="earth" />
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link href="/finance/donations"><Button variant="secondary" fullWidth>Donations</Button></Link>
        <Link href="/finance/dues"><Button variant="secondary" fullWidth>Dues</Button></Link>
        <Link href="/finance/expenses"><Button variant="secondary" fullWidth>Expenses</Button></Link>
        <Link href="/donate"><Button fullWidth>Donate</Button></Link>
      </div>

      {can("finance:approve") && pending && pending.length > 0 && (
        <Card className="mt-6 border-[var(--warning)]/40">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--warning)]" aria-hidden />
              Expenses awaiting approval
            </CardTitle>
            <Link href="/finance/expenses" className="text-sm font-semibold text-[var(--primary)]">
              Review
            </Link>
          </CardHeader>
          <CardBody className="space-y-2">
            {pending.slice(0, 3).map((e) => (
              <div key={e.id} className="rounded-[var(--radius-md)] border border-[var(--border)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--fg)]">{e.description}</p>
                    <p className="text-xs text-[var(--fg-subtle)]">
                      {e.category.toLowerCase()} · {e.paidTo} · {formatDate(e.requestedAt)}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-sm font-semibold text-[var(--fg)]">{formatKes(e.amountKes)}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
