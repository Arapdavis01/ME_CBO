"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { membersApi } from "@/lib/api/members.api";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["members", "applications"],
    queryFn: async () => (await membersApi.applications()).items,
  });

  const approve = useMutation({
    mutationFn: (id: string) => membersApi.approve(id),
    onSuccess: () => {
      toast.success("Application approved.");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
  const reject = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => membersApi.reject(id, note),
    onSuccess: () => {
      toast.success("Application rejected.");
      void qc.invalidateQueries({ queryKey: ["members"] });
    },
  });

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">Membership applications</h1>
      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4"><CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">No pending applications.</CardBody></Card>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map((a) => (
            <li key={a.id} className="rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--fg)]">{a.fullName}</p>
                  <p className="text-xs text-[var(--fg-subtle)]">{a.email} · {a.phone}</p>
                  <p className="mt-1 text-xs text-[var(--fg-subtle)]">Applied {formatDate(a.submittedAt)}</p>
                </div>
                <Badge tone={a.status === "PENDING" ? "warning" : a.status === "APPROVED" ? "success" : "danger"}>
                  {a.status.toLowerCase()}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">{a.motivation}</p>
              {a.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.skills.map((s) => <Badge key={s}>{s}</Badge>)}
                </div>
              )}
              {a.status === "PENDING" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={reject.isPending}
                    onClick={() => {
                      const note = window.prompt("Reason for rejection?") ?? "";
                      if (note.trim()) reject.mutate({ id: a.id, note });
                    }}
                  >
                    Reject
                  </Button>
                  <Button size="sm" loading={approve.isPending} onClick={() => approve.mutate(a.id)}>
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
