// apps/web/src/app/page.tsx
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Droplets,
  GraduationCap,
  Leaf,
  LogIn,
  Recycle,
  ShieldCheck,
  TreePine,
  UserPlus,
  Award,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EventCard } from "@/components/public/EventCard";
import { ProjectCard } from "@/components/public/ProjectCard";
import { getPublicEvents, getPublicProjects } from "@/lib/public/public.api";
import { siteConfig } from "@/config/site";

// What admins publish appears here within about a minute.
export const revalidate = 60;

const pillars = [
  { title: "Tree planting", text: "Indigenous and fruit trees grown with schools, farms and households.", icon: TreePine },
  { title: "Clean-ups & recycling", text: "Community clean-ups and reuse that keep waste out of our rivers and fields.", icon: Recycle },
  { title: "Water & soil", text: "Protecting riverbanks and restoring degraded land around Mosoriot.", icon: Droplets },
  { title: "Environmental learning", text: "Training that helps young people and families care for their surroundings.", icon: GraduationCap },
];

const steps = [
  { title: "Apply", text: "Tell us about yourself and why you want to join.", icon: UserPlus },
  { title: "Get approved", text: "Our team reviews your application and sends you an email to set your password.", icon: ShieldCheck },
  { title: "Take part", text: "Join field events, record your work and earn recognition for your impact.", icon: CalendarCheck },
];

const actions = [
  { title: "Become a member", text: "Volunteer your time and skills with us.", href: "/apply", cta: "Apply now" },
  { title: "Support our work", text: "Help fund seedlings, tools and training.", href: "/donate", cta: "Donate" },
  { title: "Read our stories", text: "News from our work in the community.", href: "/blog", cta: "Visit the blog" },
];

export default async function HomePage() {
  const [{ upcoming }, projects] = await Promise.all([getPublicEvents(), getPublicProjects()]);
  const nextEvents = upcoming.slice(0, 3);
  const latestProjects = projects.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="pb-safe">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[var(--primary)] text-white">
          <div className="container-mobile flex flex-col gap-8 py-12 sm:py-20 md:flex-row md:items-center md:gap-12">
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
                Mosoriot&apos;s ecosystems: one tree, one clean-up, one community at a time.
              </p>
              <div className="mt-6 flex flex-col gap-3 xs:flex-row">
                <Link href="/apply" className="xs:w-auto">
                  <Button size="lg" fullWidth>
                    Join ME_CBO <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
                <Link href="/donate" className="xs:w-auto">
                  <Button size="lg" variant="secondary" fullWidth>
                    Donate
                  </Button>
                </Link>
              </div>
            </div>

            {/* Member portal entrance */}
            <div className="md:w-[38%]">
              <div className="rounded-card bg-white/10 p-6 backdrop-blur">
                <LogIn className="h-6 w-6 text-[var(--me-leaf-400)]" aria-hidden />
                <h2 className="mt-3 text-xl font-semibold text-white">Member portal</h2>
                <p className="mt-1 text-sm text-white/75">
                  Members and officials sign in to see events, record their impact and manage the organisation.
                </p>
                <Link href="/login" className="mt-4 block">
                  <Button size="lg" variant="secondary" fullWidth>
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b border-[var(--border)] bg-[var(--bg-muted)]">
          <div className="container-mobile flex items-center gap-2 py-3 text-sm text-[var(--fg-muted)]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
            <p>{siteConfig.registration.status}.</p>
          </div>
        </section>

        {/* What we do */}
        <section className="container-mobile py-12 sm:py-16" aria-labelledby="what-we-do">
          <h2 id="what-we-do" className="text-[var(--fg)]">What we do</h2>
          <p className="mt-2 max-w-2xl text-[var(--fg-muted)]">
            Practical work that people in Mosoriot can see and take part in.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ title, text, icon: Icon }) => (
              <Card key={title} className="p-5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-[var(--fg)]">{title}</h3>
                <p className="mt-2 text-sm text-[var(--fg-muted)]">{text}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Upcoming events (from the dashboard) */}
        {nextEvents.length > 0 && (
          <section className="container-mobile pb-12 sm:pb-16" aria-labelledby="events">
            <div className="flex items-end justify-between gap-4">
              <h2 id="events" className="text-[var(--fg)]">Upcoming events</h2>
              <Link href="/community-events" className="text-sm font-semibold text-[var(--primary)] hover:underline">
                See all events
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nextEvents.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {/* Projects (from the dashboard) */}
        {latestProjects.length > 0 && (
          <section className="container-mobile pb-12 sm:pb-16" aria-labelledby="projects">
            <div className="flex items-end justify-between gap-4">
              <h2 id="projects" className="text-[var(--fg)]">Our projects</h2>
              <Link href="/projects" className="text-sm font-semibold text-[var(--primary)] hover:underline">
                See all projects
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="bg-[var(--bg-muted)] py-12 sm:py-16" aria-labelledby="how">
          <div className="container-mobile">
            <h2 id="how" className="text-[var(--fg)]">How to join</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map(({ title, text, icon: Icon }, i) => (
                <li key={title}>
                  <Card className="h-full p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-fg)]">
                        {i + 1}
                      </span>
                      <Icon className="h-5 w-5 text-[var(--primary)]" aria-hidden />
                    </div>
                    <h3 className="mt-3 text-[var(--fg)]">{title}</h3>
                    <p className="mt-1 text-sm text-[var(--fg-muted)]">{text}</p>
                  </Card>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex items-center gap-2 text-sm text-[var(--fg-muted)]">
              <Award className="h-4 w-4 text-[var(--primary)]" aria-hidden />
              Active members can earn badges and certificates for their volunteer work.
            </p>
          </div>
        </section>

        {/* Get involved */}
        <section className="container-mobile py-12 sm:py-16" aria-labelledby="involved">
          <h2 id="involved" className="text-[var(--fg)]">Get involved</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((a) => (
              <Card key={a.title} className="flex flex-col p-5">
                <h3 className="text-[var(--fg)]">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm text-[var(--fg-muted)]">{a.text}</p>
                <Link href={a.href} className="mt-4">
                  <Button variant="outline" fullWidth>{a.cta}</Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
