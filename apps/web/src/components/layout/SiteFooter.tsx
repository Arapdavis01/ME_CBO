// apps/web/src/components/layout/SiteFooter.tsx
import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { publicNav, siteConfig } from "@/config/site";

export function SiteFooter() {
  const { contact, registration } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-muted)] no-print">
      <div className="container-mobile grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo height={56} />
          <p className="mt-3 max-w-sm text-sm text-[var(--fg-muted)]">{siteConfig.description}</p>
          <p className="mt-4 inline-flex items-start gap-2 text-xs text-[var(--fg-muted)]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
            <span>
              {registration.status}.
              {registration.registrationNumber ? ` Reg. no. ${registration.registrationNumber}.` : ""}
            </span>
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold text-[var(--fg)]">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {publicNav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/apply" className="text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline">
                Become a member
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-[var(--fg-muted)] hover:text-[var(--fg)] hover:underline">
                Member sign in
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-[var(--fg)]">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--fg-muted)]">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{contact.address}</li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <a href={`tel:${contact.phoneTel}`} className="hover:underline">{contact.phone}</a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <p className="container-mobile py-4 text-xs text-[var(--fg-subtle)]">
          © {year} {siteConfig.fullName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
