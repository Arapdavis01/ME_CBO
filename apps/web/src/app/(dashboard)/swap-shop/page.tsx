"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Recycle } from "lucide-react";
import { swapApi } from "@/lib/api/swap.api";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const filters = ["All", "FURNITURE", "ELECTRONICS", "CLOTHING", "TOOLS", "GARDEN", "OTHER"] as const;
type Filter = (typeof filters)[number];

export default function SwapShopPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["swap", "list"],
    queryFn: async () => (await swapApi.list()).items,
  });
  const [filter, setFilter] = useState<Filter>("All");

  const items = useMemo(() => {
    if (!data) return [];
    return filter === "All" ? data : data.filter((x) => x.category === filter);
  }, [data, filter]);

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[var(--fg)]">Zero-waste swap shop</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Give away what you don&apos;t need. Claim what you do. Keep it out of landfill.
          </p>
        </div>
        <Link href="/swap-shop/new">
          <Button size="sm">
            <Plus className="h-4 w-4" /> List
          </Button>
        </Link>
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-ring min-h-[36px]",
                filter === f
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-muted)]",
              )}
            >
              {f === "All" ? "All" : f.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="mt-4">
          <CardBody className="py-10 text-center">
            <Recycle className="mx-auto h-8 w-8 text-[var(--fg-subtle)]" aria-hidden />
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Nothing here yet. Be the first to list an item.
            </p>
            <div className="mt-4">
              <Link href="/swap-shop/new">
                <Button>List an item</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/swap-shop/${it.id}`}
              className="block rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3 transition hover:shadow-geo focus-ring"
            >
              {it.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.photoUrl}
                  alt=""
                  className="aspect-square w-full rounded-[var(--radius-md)] object-cover"
                />
              ) : (
                <div className="aspect-square w-full rounded-[var(--radius-md)] bg-[var(--bg-muted)]" />
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-[var(--fg)]">
                  {it.title}
                </p>
                {it.status !== "AVAILABLE" && (
                  <Badge tone={it.status === "CLAIMED" ? "neutral" : "warning"}>
                    {it.status.toLowerCase()}
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-[var(--fg-subtle)]">
                {it.condition.toLowerCase().replace("_", " ")} · {it.location}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
