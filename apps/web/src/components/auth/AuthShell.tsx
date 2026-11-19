import Link from "next/link";
import { Leaf } from "lucide-react";
import { siteConfig } from "@/config/site";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[var(--bg)]">
      <div className="container-mobile flex flex-1 flex-col justify-center py-8 sm:py-12">
        <Link
          href="/"
          className="mx-auto mb-6 inline-flex items-center gap-2 focus-ring rounded-md"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
            <Leaf className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-sm font-bold text-[var(--fg)]">
            {siteConfig.shortName}
          </span>
        </Link>

        <div className="mx-auto w-full max-w-md rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-geo sm:p-7">
          <h1 className="text-2xl text-[var(--fg)]">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--fg-muted)]">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <div className="mx-auto mt-4 w-full max-w-md text-center text-sm text-[var(--fg-muted)]">
            {footer}
          </div>
        )}

        <p className="mx-auto mt-8 max-w-md text-center text-xs text-[var(--fg-subtle)]">
          {siteConfig.contact.address} · {siteConfig.contact.phone}
        </p>
      </div>
    </main>
  );
}
