"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { swapApi } from "@/lib/api/swap.api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardBody } from "@/components/ui/Card";
import { ApiError } from "@/lib/api/client";

export default function SwapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: listing, isLoading } = useQuery({
    queryKey: ["swap", id],
    queryFn: async () => (await swapApi.detail(id)).listing,
  });

  const claim = useMutation({
    mutationFn: () => swapApi.claim(id),
    onSuccess: () => {
      toast.success("Reserved! Contact the owner to arrange pickup.");
      void qc.invalidateQueries({ queryKey: ["swap"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not claim.";
      toast.error(msg);
    },
  });

  if (isLoading || !listing) {
    return (
      <div className="container-mobile py-5 sm:py-8 space-y-3">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link href="/swap-shop" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">
        ← Swap shop
      </Link>

      {listing.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.photoUrl}
          alt=""
          className="mt-3 aspect-square w-full rounded-card object-cover sm:aspect-video"
        />
      ) : (
        <div className="mt-3 aspect-square w-full rounded-card bg-[var(--bg-muted)] sm:aspect-video" />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="primary">{listing.category.toLowerCase()}</Badge>
        <Badge tone="neutral">{listing.condition.toLowerCase().replace("_", " ")}</Badge>
        <Badge tone={listing.status === "AVAILABLE" ? "success" : "warning"}>
          {listing.status.toLowerCase()}
        </Badge>
      </div>

      <h1 className="mt-2 text-[var(--fg)]">{listing.title}</h1>
      <p className="mt-2 whitespace-pre-line text-sm text-[var(--fg-muted)]">
        {listing.description}
      </p>

      <Card className="mt-4">
        <CardBody className="text-sm">
          <p className="text-[var(--fg)]">
            <strong>Listed by:</strong> {listing.ownerName}
          </p>
          <p className="mt-1 text-[var(--fg)]">
            <strong>Location:</strong> {listing.location}
          </p>
        </CardBody>
      </Card>

      <div className="mt-5">
        <Button
          size="lg"
          fullWidth
          loading={claim.isPending}
          disabled={listing.status !== "AVAILABLE"}
          onClick={() => claim.mutate()}
        >
          {listing.status === "AVAILABLE"
            ? "Reserve this item"
            : listing.status === "RESERVED"
              ? "Already reserved"
              : "Already claimed"}
        </Button>
      </div>
    </div>
  );
}
