import Link from "next/link";
import { Leaf, TreePine, Recycle, Users, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/config/site";

const stats = [
  { label: "Trees planted", value: "12,480", icon: TreePine },
  { label: "Waste collected", value: "8.2t", icon: Recycle },
  { label: "Active members", value: "340+", icon: Users },
];

const actions = [
  {
    title: "Join a clean-up",
    text: "Find a field event near Mosoriot and RSVP in one tap.",
    href: "/events",
    cta: "View events",
  },
  {
    title: "Plant with us",
    text: "Sponsor a seedling or join a reforestation drive.",
    href: "/donate",
    cta: "Donate",
  },
  {
    title: "Become a member",
    text: "Volunteer your skills and track your impact.",
    href: "/apply",
    cta: "Apply now",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="pb-safe">
        {/* Hero — mobile-first stacked layout */}
        <section className="relative overflow-hidden bg-[var(--primary)] text-white">
          <div className="container-mobile flex flex-col gap-6 py-10 sm:py-16 md:flex-row md:items-center md:gap-10">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Leaf className="h-3.5 w-3.5" aria-hidden />
                {siteConfig.motto}
              </span>
              <h1 className="mt-4 text-white">
                Caring for Creation,{" "}
                <span className="text-[var(--me-leaf-400)]">Sustaining Our Future</span>
              </h1>
              <p className="mt-3 max-w-prose text-white/80">
                {siteConfig.fullName} brings neighbours together to restore
                Mosoriot&apos;s ecosystems — one tree, one clean-up, one
                community at a time.
              </p>
              <div className="mt-6 flex flex-col gap-3 xs:flex-row">
                <Link href="/apply" className="xs:w-auto">
                  <Button size="lg" fullWidth>
                    Join ME_CBO <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/donate" className="xs:w-auto">
                  <Button size="lg" variant="secondary" fullWidth>
                    Donate
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xs:grid-cols-3 md:w-[42%]">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-card bg-white/10 p-4 backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-[var(--me-leaf-400)]" aria-hidden />
                  <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Actions — single column on phones */}
        <section className="container-mobile py-10 sm:py-14">
          <h2 className="text-[var(--fg)]">Get involved</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((a) => (
              <Card key={a.title} className="flex flex-col p-5">
                <h3 className="text-[var(--fg)]">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm text-[var(--fg-muted)]">
                  {a.text}
                </p>
                <Link href={a.href} className="mt-4">
                  <Button variant="outline" fullWidth>
                    {a.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact strip */}
        <section className="border-t border-[var(--border)] bg-[var(--bg-muted)]">
          <div className="container-mobile flex flex-col gap-2 py-6 text-sm text-[var(--fg-muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>{siteConfig.contact.address}</p>
            <a
              href={`tel:${siteConfig.contact.phoneTel}`}
              className="font-semibold text-[var(--primary)] focus-ring rounded"
            >
              {siteConfig.contact.phone}
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
