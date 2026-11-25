// apps/web/src/app/(public)/projects/page.tsx
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ProjectCard } from "@/components/public/ProjectCard";
import { getPublicProjects } from "@/lib/public/public.api";
import { PHASE_LABELS } from "@/lib/public/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "Tree planting, clean-up and restoration projects by ME_CBO in Mosoriot, Nandi County.",
};

const ORDER = ["ONGOING", "PLANNED", "COMPLETED"] as const;

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <>
      <SiteHeader />
      <main className="container-mobile py-10 sm:py-14">
        <h1 className="text-[var(--fg)]">Our projects</h1>
        <p className="mt-2 max-w-2xl text-[var(--fg-muted)]">
          The work we are doing, and have done, to restore the environment around Mosoriot.
        </p>

        {projects.length === 0 ? (
          <p className="mt-10 rounded-xl border border-[var(--border)] p-6 text-[var(--fg-muted)]">
            Our projects will be listed here soon. Please check back.
          </p>
        ) : (
          ORDER.map((phase) => {
            const items = projects.filter((p) => p.phase === phase);
            if (items.length === 0) return null;
            return (
              <section key={phase} className="mt-10" aria-labelledby={`phase-${phase}`}>
                <h2 id={`phase-${phase}`} className="text-[var(--fg)]">{PHASE_LABELS[phase]}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>
      <SiteFooter />
    </>
  );
}
