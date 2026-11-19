"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin.api";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { format, isToday, isYesterday } from "date-fns";

function groupDate(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-logs", page],
    queryFn: async () => await adminApi.auditLogs({ page, pageSize: 30 }),
  });

  const grouped = useMemo(() => {
    if (!data) return [];
    const m = new Map<string, typeof data.items>();
    for (const e of data.items) {
      const key = groupDate(e.createdAt);
      const arr = m.get(key) ?? [];
      arr.push(e);
      m.set(key, arr);
    }
    return Array.from(m.entries());
  }, [data]);

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">Audit logs</h1>
      <p className="mt-1 text-sm text-[var(--fg-muted)]">Immutable trail of every privileged action.</p>

      {isLoading ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : !data || data.items.length === 0 ? (
        <Card className="mt-4"><CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">No audit entries yet.</CardBody></Card>
      ) : (
        <>
          {grouped.map(([day, items]) => (
            <div key={day} className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-subtle)]">{day}</p>
              <ul className="space-y-1.5">
                {items.map((e) => (
                  <li key={e.id} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--fg)]">{e.action}</p>
                        <p className="truncate text-xs text-[var(--fg-subtle)]">{e.actorName}{e.target ? ` → ${e.target}` : ""}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-[var(--fg-subtle)]">{format(new Date(e.createdAt), "HH:mm")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-5 flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex-1 min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] text-sm font-medium text-[var(--fg)] disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={(data?.items.length ?? 0) < 30}
              onClick={() => setPage((p) => p + 1)}
              className="flex-1 min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] text-sm font-medium text-[var(--fg)] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
