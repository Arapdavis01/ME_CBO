"use client";

import Link from "next/link";
import { Users, ShieldCheck, ScrollText, Settings, ArrowRight } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

const links = [
  { href: "/admin/users", title: "Users", text: "Manage roles and access", icon: Users },
  { href: "/admin/roles", title: "Roles", text: "Permission matrix", icon: ShieldCheck },
  { href: "/admin/audit-logs", title: "Audit logs", text: "Immutable activity trail", icon: ScrollText },
  { href: "/admin/settings", title: "Settings", text: "Organization configuration", icon: Settings },
];

export default function AdminPage() {
  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">Admin</h1>
      <p className="mt-1 text-sm text-[var(--fg-muted)]">Super Admin controls.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map(({ href, title, text, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition hover:shadow-geo focus-ring"
          >
            <Icon className="h-5 w-5 text-[var(--primary)]" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-[var(--fg)]">{title}</p>
            <p className="text-xs text-[var(--fg-subtle)]">{text}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
              Open <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
