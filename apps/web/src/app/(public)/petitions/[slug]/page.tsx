"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { petitionsApi } from "@/lib/api/petitions.api";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";

export default function PetitionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["petitions", slug],
    queryFn: async () => (await petitionsApi.detail(slug)).petition,
  });

  const sign = useMutation({
    mutationFn: () => petitionsApi.sign(slug),
    onSuccess: () => {
      toast.success("Thank you — your signature was recorded.");
      void qc.invalidateQueries({ queryKey: ["petitions"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not sign.";
      toast.error(msg);
    },
  });

  if (isLoading || !data) {
    return (
      <>
        <SiteHeader />
        <main className="container-mobile py-6"><Skeleton className="h-64" /></main>
      </>
    );
  }

  const pct = Math.min(100, Math.round((data.currentSignatures / data.goalSignatures) * 100));

  return (
    <>
      <SiteHeader />
      <main className="container-mobile py-6 sm:py-10">
        <Link href="/petitions" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">← Petitions</Link>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone={data.status === "OPEN" ? "success" : "neutral"}>{data.status.toLowerCase()}</Badge>
        </div>
        <h1 className="mt-2 text-[var(--fg)]">{data.title}</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">To: <strong className="text-[var(--fg)]">{data.target}</strong></p>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
            <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-[var(--fg-subtle)]">
            {data.currentSignatures.toLocaleString()} of {data.goalSignatures.toLocaleString()} ({pct}%) · closes {formatDate(data.closesAt)}
          </p>
        </div>

        <div className="prose-sm mt-4 whitespace-pre-line text-sm text-[var(--fg-muted)]">
          {data.body}
        </div>

        <Card className="mt-6">
          <CardBody>
           
