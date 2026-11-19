"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Leaf,
  Users,
  Package,
  AlertTriangle,
  Repeat,
  BookOpen,
  Wallet,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/auth/permissions";
import { siteConfig } from "@/config/site";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

const items: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: CalendarDays, permission: "events:read" },
  { label: "Impact", href: "/impact", icon: Leaf, permission: "impact:read" },
  { label: "Members", href: "/members", icon: Users, permission: "members:read" },
  { label: "Inventory", href: "/inventory", icon: Package, permission: "inventory:read" },
  { label: "Incidents", href: "/incidents", icon: AlertTriangle, permission: "incidents:read" },
  { label: "Swap shop", href: "/swap-shop", icon: Repeat, permission: "swap:read" },
  { label: "Learning", href: "/learning", icon: BookOpen, permission: "learning:read" },
  { label: "Finance", href: "/finance", icon: Wallet, permission: "finance:read" },
  { label: "Admin", href: "/admin", icon: ShieldCheck, permission: "admin:users:manage" },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { can } = usePermissions();

  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Workspace">
      {items
        .filter((i) => !i.permission || can(i.permission))
        .map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium transition-colors focus-ring min-h-[44px]",
                active
                  ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)] lg:block no-print">
        <div className="flex h-[var(--header-h)] items-center gap-2 border-b border-[var(--border)] px-4">
          <span className="text-sm font-bold text-[var(--fg)]">
            {siteConfig.shortName}
          </span>
        </div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden no-print",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-[82%] max-w-xs bg-[var(--bg-elevated)] shadow-geo-lg transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-[var(--header-h)] items-center justify-between border-b border-[var(--border)] px-4">
            <span className="text-sm font-bold text-[var(--fg)]">
              {siteConfig.shortName}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="touch-target rounded-md text-[var(--fg)] focus-ring"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          {nav}
        </aside>
      </div>
    </>
  );
}
