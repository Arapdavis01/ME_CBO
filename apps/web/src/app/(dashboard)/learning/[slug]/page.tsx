"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { learningApi } from "@/lib/api/learning.api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

/**
 * Simple markdown-ish renderer. Paragraphs split on blank lines,
 * headings starting with ## become h2. Inline emphasis is left
 * to the browser as plain text for safety — no dangerouslySetInnerHTML.
 */
function renderBody(body: string) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((b, i) => {
    if (b.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-6 text-lg font-semibold text-[var(--fg)]">
          {b.replace(/^##\s+/, "")}
        </h2>
      );
    }
    if (b.startsWith("# ")) {
      return (
        <h2 key={i} className="mt-6 text-xl font-bold text-[var(--fg)]">
          {b.replace(/^#\s+/, "")}
        </h2>
      );
    }
    if (b.startsWith("- ")) {
      const items = b.split("\n").map((l) => l.replace(/^-\s+/, ""));
      return (
        <ul key={i} className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--fg-muted)]">
          {items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
        {b}
      </p>
    );
  });
}

export default function LearningDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["learning", slug],
    queryFn: async () => (await learningApi.detail(slug)).resource,
  });

  if (isLoading || !data) {
    return (
      <div className="container-mobile py-5 sm:py-8 space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <article className="container-mobile py-5 sm:py-8">
      <Link
        href="/learning"
        className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
      >
        ← Learning hub
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="primary">{data.category.toLowerCase()}</Badge>
        <span className="inline-flex items-center gap-1 text-xs text-[var(--fg-subtle)]">
          <Clock className="h-3.5 w-3.5" aria-hidden /> {data.durationMin} min ·{" "}
          {formatDate(data.publishedAt)}
        </span>
      </div>
      <h1 className="mt-2 text-[var(--fg)]">{data.title}</h1>
      {data.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.coverImageUrl}
          alt=""
          className="mt-4 aspect-video w-full rounded-card object-cover"
        />
      )}
      <div className="mt-4">{renderBody(data.body)}</div>
    </article>
  );
}
