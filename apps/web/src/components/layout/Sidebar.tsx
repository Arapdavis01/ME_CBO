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
  Briefcase,
  Megaphone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/auth/permissions";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";

/* -------------------------------------------------------------------------- */
/*  Nav model                                                                  */
/* -------------------------------------------------------------------------- */

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Single permission gate. */
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
    anyOf: ["finance:read", "donations:read"],
  },
  { label: "Projects", href: "/admin/projects", icon: Briefcase, permission: "projects:manage" },
  { label: "Site notices", href: "/admin/announcements", icon: Megaphone, permission: "announcements:manage" },
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
  const triggerRef = useRef<HTMLElement | null>(null);

  /* -------------------------------------------------------------------- */
  /*  Save the element that opened the drawer, so we can restore focus      */
  /*  after close (WCAG 2.4.3 — Focus Order).                               */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (mobileOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
    } else if (triggerRef.current) {
      triggerRef.current.focus?.();
      triggerRef.current = null;
    }
  }, [mobileOpen]);

  /* -------------------------------------------------------------------- */
  /*  Lock body scroll while mobile drawer is open.                        */
  /*  Compensate for the scrollbar width on desktop browsers to prevent    */
  /*  layout shift when the drawer opens.                                  */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (!mobileOpen) return;
    const body = document.body;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [mobileOpen]);

  /* -------------------------------------------------------------------- */
  /*  Keyboard: Escape closes, Tab is trapped inside the drawer.           */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (!mobileOpen) return;

    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;

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
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  /* -------------------------------------------------------------------- */
  /*  Auto-close the mobile drawer whenever the route changes.             */
  /*  This handles programmatic navigation (e.g. from a toast action),     */
  /*  browser back/forward, and deep links — not just link clicks.         */
  /*  It also closes the drawer when the logo link is tapped.              */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (mobileOpen) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isVisible = (i: Item): boolean => {
    if (i.anyOf) return canAny(i.anyOf);
    if (i.permission) return can(i.permission);
    return true;
  };

  const visibleItems = items.filter(isVisible);
  // Longest matching prefix wins, so /members/new does not also light up /members.
  const activeHref = visibleItems
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Workspace">
      {visibleItems.map(({ label, href, icon: Icon }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex min-h-[44px] items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-colors focus-ring",
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
      <aside className="no-print hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] lg:flex">
        <div className="flex items-center border-b border-[var(--border)] px-4 py-4">
          {/* The logo image already contains the name "ME CBO" */}
          <Logo height={64} href="/dashboard" />
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
          "no-print fixed inset-0 z-50 lg:hidden",
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
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <Logo height={56} href="/dashboard" />
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
