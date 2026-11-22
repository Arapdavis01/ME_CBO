"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, LogOut, Menu, Moon, Sun, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/providers/ThemeProvider";
import { roleLabel } from "@/lib/auth/permissions";
import { Logo } from "@/components/ui/Logo";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] glass no-print">
      <div className="flex h-[var(--header-h)] items-center gap-2 px-3 sm:px-5">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="lg:hidden touch-target rounded-md text-[var(--fg)] focus-ring"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <div className="flex min-w-0 flex-1 items-center">
          {/* Phones and tablets: the sidebar is hidden, so show the logo here.
              The logo image already contains the name "ME CBO". */}
          <div className="lg:hidden">
            <Logo height={36} href="/dashboard" />
          </div>
          {/* Desktop: the sidebar already shows the logo. */}
          <span className="hidden truncate text-sm font-semibold text-[var(--fg)] lg:block">
            ME_CBO Workspace
          </span>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className="touch-target rounded-md text-[var(--fg)] focus-ring"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" aria-hidden />
          ) : (
            <Moon className="h-5 w-5" aria-hidden />
          )}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="hidden xs:inline-flex touch-target rounded-md text-[var(--fg)] focus-ring"
        >
          <Bell className="h-5 w-5" aria-hidden />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="touch-target inline-flex items-center gap-2 rounded-md pl-1 pr-2 focus-ring"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
              <UserCircle className="h-5 w-5" aria-hidden />
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-[var(--fg)] sm:inline">
              {user?.fullName ?? "Guest"}
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-geo"
            >
              <div className="border-b border-[var(--border)] px-3 py-2">
                <p className="truncate text-sm font-semibold text-[var(--fg)]">
                  {user?.fullName}
                </p>
                <p className="truncate text-xs text-[var(--fg-subtle)]">
                  {user ? roleLabel[user.role] : ""}
                </p>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-sm text-[var(--fg)] hover:bg-[var(--bg-muted)]"
              >
                My profile
              </Link>
              <Link
                href="/profile/security"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-sm text-[var(--fg)] hover:bg-[var(--bg-muted)]"
              >
                Security & MFA
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
                className="flex w-full items-center gap-2 border-t border-[var(--border)] px-3 py-2.5 text-left text-sm text-[var(--danger)] hover:bg-[var(--bg-muted)]"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
