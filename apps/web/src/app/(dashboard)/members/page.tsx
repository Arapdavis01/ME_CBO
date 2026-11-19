"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserCheck } from "lucide-react";
import { membersApi } from "@/lib/api/members.api";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function MembersPage() {
  const [q, setQ] = useState("");
  const { can } = usePermissions();
  const { data, isLoading } = useQuery({
    queryKey: ["members", q],
    queryFn: async () => (await membersApi.list({ q })).items,
  });

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[var(--fg)]">Members</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">Directory & skill finder.</p>
        </div>
        {can("members:approve") && (
          <Link href="/members/applications">
            <Button size="sm"><UserCheck className="h-4 w-4" /> Applications</Button>
          </Link>
        )}
      </div>

      <div className="mt-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, skill, or location…"
          className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] pl-10 pr-3 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
        />
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4"><CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">No members found.</CardBody></Card>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-fg)]">
                {m.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--fg)]">{m.fullName}</p>
                <p className="truncate text-xs text-[var(--fg-subtle)]">
                  {m.role.replaceAll("_", " ").toLowerCase()} · {m.location}
                </p>
              </div>
              <Badge tone={m.status === "ACTIVE" ? "success" : "neutral"}>{m.status.toLowerCase()}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
