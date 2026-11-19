"use client";

import Link from "next/link";
import { useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { siteConfig, publicNav } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] glass no-print">
      <div className="container-mobile flex h-[var(--header-h)] items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 focus-ring rounded-md">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
            <Leaf className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-[var(--fg)]">
              {siteConfig.shortName}
            </span>
            <span className="hidden text-[11px] text-[var(--fg-subtle)] xs:block">
              Mosoriot Environmental CBO
            </span>
          </span>
        </Link>

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
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/apply">
            <Button size="sm">Join us</Button>
          </Link>
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
          <div className="mt-2 grid grid-cols-2 gap-
