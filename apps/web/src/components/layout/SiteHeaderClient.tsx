// apps/web/src/components/layout/SiteHeaderClient.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { publicNav } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export function SiteHeaderClient({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] glass no-print">
      <div className="container-mobile flex h-[var(--header-h)] items-center justify-between gap-3">
        {/* The wordmark inside the picture is small here, so the short name sits beside it */}
        <Logo height={52} showName priority />

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden md:flex items-center gap-1">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {signedIn ? (
            <Link href="/dashboard">
              <Button size="sm">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/apply">
                <Button size="sm">Join us</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden touch-target rounded-md text-[var(--fg)] focus-ring"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden overflow-hidden border-t border-[var(--border)] transition-[max-height] duration-300",
          open ? "max-h-[420px]" : "max-h-0",
        )}
      >
        <nav className="container-mobile flex flex-col gap-1 py-3" aria-label="Mobile">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-[var(--fg)] hover:bg-[var(--bg-muted)] focus-ring"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {signedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="col-span-2">
                <Button fullWidth>Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" fullWidth>
                    Sign in
                  </Button>
                </Link>
                <Link href="/apply" onClick={() => setOpen(false)}>
                  <Button fullWidth>Join us</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
