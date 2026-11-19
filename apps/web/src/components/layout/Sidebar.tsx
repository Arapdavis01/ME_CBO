"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
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

/* -------------------------------------------------------------------------- */
/*  Nav model                                                                  */
/* -------------------------------------------------------------------------- */

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Single permission gate (kept for backwards compat). */
  permission?: Permission;
  /** Alternative gate — visible if the user holds ANY of these. */
  anyOf?: Permission[];
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
  {
    label: "Finance",
    href: "/finance",
    icon: Wallet,
    // Visible to finance admin OR anyone who can read donations
    anyOf: ["finance:read", "donations:read"],
  },
  { label: "Admin", href: "/admin", icon: ShieldCheck, permission: "admin:users:manage" },
];

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { can, canAny } = usePermissions();
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  /* ---- Lock body scroll while mobile drawer open ---- */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  /* ---- Escape closes drawer, focus moves into it ---- */
  useEffect(() => {
    if (!mobileOpen) return;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // Simple focus trap
      if (e.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  const isVisible = (i: Item): boolean => {
    if (i.anyOf) return canAny(i.anyOf);
    if (i.permission) return can(i.permission);
    return true;
  };

  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Workspace">
      {items.filter(isVisible).map(({ label, href, icon: Icon }) => {
        // Exact match OR nested sub-route
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-colors focus-ring min-h-[44px]",
              active
                ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                : "text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                active ? "stroke-[2.2]" : "stroke-[1.9]",
              )}
              aria-hidden
            />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/*  Desktop sidebar                                                 */}
      {/* ---------------------------------------------------------------- */}
      <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--bg-elevated)] lg:flex lg:flex-col no-print">
        <div className="flex h-[var(--header-h)] items-center gap-2 border-b border-[var(--border)] px-4">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
            <Leaf className="h-4 w-4" aria-hidden />
          </span>
          <span className="truncate text-sm font-bold text-[var(--fg)]">
            {siteConfig.shortName}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-[var(--border)] px-4 py-3 text-[11px] text-[var(--fg-subtle)]">
          {siteConfig.motto}
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/*  Mobile drawer                                                   */}
      {/* ---------------------------------------------------------------- */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden no-print",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Drawer panel */}
        <aside
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Workspace navigation"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-[var(--bg-elevated)] shadow-geo-lg transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-[var(--header-h)] items-center justify-between border-b border-[var(--border)] px-4">
            <span className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
                <Leaf className="h-4 w-4" aria-hidden />
              </span>
              <span className="truncate text-sm font-bold text-[var(--fg)]">
                {siteConfig.shortName}
              </span>
            </span>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="touch-target rounded-md text-[var(--fg)] focus-ring"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{nav}</div>
          <div className="border-t border-[var(--border)] px-4 py-3 text-[11px] text-[var(--fg-subtle)]">
            {siteConfig.motto}
          </div>
        </aside>
      </div>
    </>
  );
}
