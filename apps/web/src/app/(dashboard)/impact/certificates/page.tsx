"use client";

import Link from "next/link";
import { useCertificates } from "@/hooks/useImpact";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Award } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CertificatesPage() {
  const { data, isLoading } = useCertificates();

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link href="/impact" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">
        ← Impact
      </Link>
      <h1 className="mt-2 text-[var(--fg)]">My certificates</h1>
      <p className="mt-1 text-sm text-[var(--fg-muted)]">
        Verifiable proof of your contribution — shareable, printable, and unique.
      </p>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4">
          <CardBody className="py-10 text-center">
            <Award className="mx-auto h-8 w-8 text-[var(--fg-subtle)]" aria-hidden />
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              No certificates yet. Log events to unlock your first.
            </p>
          </CardBody>
        </Card>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map((c) => (
            <li key={c.id}>
              <Link
                href={`/impact/certificates/${c.id}`}
                className="block rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition hover:shadow-geo focus-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--fg)]">
                      {c.title}
                    </p>
                    <p className="text-xs text-[var(--fg-subtle)]">
                      Issued {formatDate(c.issuedAt)}
                    </p>
                  </div>
                  <Badge tone="success">Verified</Badge>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--fg-muted)]">
                  <span>{c.metrics.treesPlanted} trees</span>
                  <span>·</span>
                  <span>{c.metrics.wasteCollectedKg} kg waste</span>
                  <span>·</span>
                  <span>{c.metrics.volunteerHours} h</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link href="/impact">
          <Button variant="secondary" fullWidth>Back to impact</Button>
        </Link>
      </div>
    </div>
  );
}
