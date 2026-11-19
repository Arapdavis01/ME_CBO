"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  Leaf,
  Users,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Impact", href: "/impact", icon: Leaf },
  { label: "Members", href: "/members", icon: Users },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] glass md:hidden no-print"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                  "min-h-[56px] justify-center transition-colors focus-ring",
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--fg-subtle)] hover:text-[var(--fg)]",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.4]")}
                  aria-hidden
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
