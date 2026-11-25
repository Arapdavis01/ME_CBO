// apps/web/src/app/(public)/projects/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, CalendarDays, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getPublicProject } from "@/lib/public/public.api";
import { PHASE_LABELS, formatMonthYear, paragraphs } from "@/lib/public/format";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPublicProject(params.slug);
  return p ? { title: p.title, description: p.summary } : { title: "Project not found" };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getPublicProject(params.slug);
  if (!project) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        {project.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverImageUrl} alt="" className="h-56 w-full object-cover sm:h-80" />
        )}
        <article className="container-mobile mx-auto max-w-3xl py-10 sm:py-14">
          <Link href="/projects" className="text-sm underline">← All projects</Link>
          <span className="mt-4 block w-fit rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
            {PHASE_LABELS[project.phase]}
          </span>
          <h1 className="mt-3 text-[var(--fg)]">{project.title}</h1>
          <p className="mt-3 text-lg text-[var(--fg-muted)]">{project.summary}</p>

          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--fg-muted)]">
            {project.location && (
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden />{project.location}</li>
            )}
            {project.startDate && (
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {formatMonthYear(project.startDate)}
                {project.endDate ? ` – ${formatMonthYear(project.endDate)}` : ""}
              </li>
            )}
          </ul>

          <div className="mt-8 space-y-4">
            {paragraphs(project.description).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {project.highlights.length > 0 && (
            <section className="mt-8" aria-labelledby="highlights">
              <h2 id="highlights" className="text-[var(--fg)]">Highlights</h2>
              <ul className="mt-3 space-y-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-[var(--fg-muted)]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-10 flex flex-col gap-3 xs:flex-row">
            <Link href="/apply"><Button size="lg" fullWidth>Join this work</Button></Link>
            <Link href="/donate"><Button size="lg" variant="outline" fullWidth>Support it</Button></Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
