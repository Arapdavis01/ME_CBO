"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin.api";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import type { Role } from "@/lib/auth/permissions";
import { roleLabel } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils";

const ROLES: Role[] = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "FINANCE_ADMIN", "TEAM_LEAD", "MEMBER"];

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (await adminApi.users()).items,
  });
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return q ? data.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : data;
  }, [data, search]);

  const setRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => adminApi.setRole(id, role),
    onSuccess: () => {
      toast.success("Role updated.");
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">Users</h1>
      <div className="mt-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
        />
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <ul className="mt-4 space-y-2">
          {filtered.map((u) => (
            <li key={u.id} className="rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--fg)]">{u.fullName}</p>
                  <p className="truncate text-xs text-[var(--fg-subtle)]">{u.email}</p>
                  <p className="text-xs text-[var(--fg-subtle)]">Joined {formatDate(u.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone={u.status === "ACTIVE" ? "success" : "danger"}>{u.status.toLowerCase()}</Badge>
                  {u.mfaEnabled ? <Badge tone="primary">MFA</Badge> : <Badge tone="warning">No MFA</Badge>}
                </div>
              </div>
              <div className="mt-2">
                <label className="text-xs text-[var(--fg-subtle)]">Role</label>
                <select
                  value={u.role}
                  onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value as Role })}
                  className="mt-1 w-full min-h-[40px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
