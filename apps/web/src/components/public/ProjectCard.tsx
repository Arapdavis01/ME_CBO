// apps/web/src/components/public/ProjectCard.tsx
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { PublicProject } from "@/lib/public/public.api";
import { PHASE_LABELS } from "@/lib/public/format";

export function ProjectCard({ project }: { project: PublicProject }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {project.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.coverImageUrl} alt="" loading="lazy" className="h-44 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
          {PHASE_LABELS[project.phase]}
        </span>
        <h3 className="mt-3 text-[var(--fg)]">
          <Link href={`/projects/${project.slug}`} className="hover:underline">
            {project.title}
          </Link>
        </h3>
        {project.location && (
          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--fg-muted)]">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {project.location}
          </p>
        )}
        <p className="mt-3 flex-1 text-sm text-[var(--fg-muted)]">{project.summary}</p>
        <Link
          href={`/projects/${project.slug}`}
          className="mt-4 text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          Read more
        </Link>
      </div>
    </Card>
  );
}
