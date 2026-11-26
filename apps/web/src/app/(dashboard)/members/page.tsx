"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserCheck, UserPlus, Users, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api/client";
import { membersApi } from "@/lib/api/members.api";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type MembersSummary = {
  activeMembers: number;
  leaders: { id: string; fullName: string; role: string; avatarUrl?: string | null }[];
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Chairperson / CEO",
  OPERATIONS_ADMIN: "Secretary",
  FINANCE_ADMIN: "Treasurer",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function MembersPage() {
  const { can } = usePermissions();
  const isAdminView = can("members:directory");

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[var(--fg)]">Members</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {isAdminView ? "Directory & skill finder." : "Our leadership and community."}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {can("members:approve") && (
            <Link href="/members/applications">
              <Button size="sm" variant="outline">
                <UserCheck className="h-4 w-4" /> Applications
              </Button>
            </Link>
          )}
          {can("members:create") && (
            <Link href="/members/new">
              <Button size="sm">
                <UserPlus className="h-4 w-4" /> Add member
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isAdminView ? <Directory /> : <LeadersView />}
    </div>
  );
}

/* ------------------------- Admin: full directory ------------------------- */

function Directory() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["members", q],
    queryFn: async () => (await membersApi.list({ q })).items,
  });

  return (
    <>
      <div className="relative mt-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, skill, or location…"
          className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-3 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
        />
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4">
          <CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">
            No members found.
          </CardBody>
        </Card>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-fg)]">
                {initials(m.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--fg)]">{m.fullName}</p>
                <p className="truncate text-xs text-[var(--fg-subtle)]">
                  {m.role.replaceAll("_", " ").toLowerCase()}
                  {m.location ? ` · ${m.location}` : ""}
                </p>
              </div>
              <Badge tone={m.status === "ACTIVE" ? "success" : "neutral"}>
                {m.status.toLowerCase()}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* --------------- Ordinary member: admins + active-member count --------------- */

function LeadersView() {
  const { data, isLoading } = useQuery({
    queryKey: ["members", "summary"],
    queryFn: () => api.get<MembersSummary>("/members/summary"),
  });

  if (isLoading || !data) {
    return (
      <div className="mt-4 space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  return (
    <>
      <Card className="mt-4">
        <CardBody className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--bg-muted)] text-[var(--primary)]">
            <Users className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-3xl font-bold text-[var(--fg)]">
              {data.activeMembers.toLocaleString()}
            </p>
            <p className="text-sm text-[var(--fg-muted)]">Active members</p>
          </div>
        </CardBody>
      </Card>

      <h2 className="mb-2 mt-6 flex items-center gap-2 text-base font-semibold text-[var(--fg)]">
        <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden />
        Our leadership
      </h2>
      <ul className="space-y-2">
        {data.leaders.map((l) => (
          <li
            key={l.id}
            className="flex items-center gap-3 rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-fg)]">
              {initials(l.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--fg)]">{l.fullName}</p>
              <p className="truncate text-xs text-[var(--fg-subtle)]">
                {ROLE_LABELS[l.role] ?? l.role.replaceAll("_", " ").toLowerCase()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
