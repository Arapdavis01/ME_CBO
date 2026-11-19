"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { learningApi } from "@/lib/api/learning.api";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookOpen, Clock } from "lucide-react";

export default function LearningPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["learning", "list"],
    queryFn: async () => (await learningApi.list()).items,
  });

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">Learning hub</h1>
      <p className="mt-1 text-sm text-[var(--fg-muted)]">
        Short guides on composting, reforestation, and everyday climate action.
      </p>

      {isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4">
          <CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">
            <BookOpen className="mx-auto h-8 w-8 text-[var(--fg-subtle)]" aria-hidden />
            <p className="mt-2">New guides are added weekly. Check back soon.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <Link
              key={r.id}
              href={`/learning/${r.slug}`}
              className="block rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition hover:shadow-geo focus-ring"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone="primary">{r.category.toLowerCase()}</Badge>
                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--fg-subtle)]">
                  <Clock className="h-3 w-3" aria-hidden /> {r.durationMin} min
                </span>
              </div>
              <h3 className="mt-2 clamp-2 text-base font-semibold text-[var(--fg)]">
                {r.title}
              </h3>
              <p className="mt-1 clamp-3 text-sm text-[var(--fg-muted)]">{r.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
