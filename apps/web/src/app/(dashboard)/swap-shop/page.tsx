"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Repeat, Search, X } from "lucide-react";
import {
  swapApi,
  SWAP_CATEGORIES,
  type SwapListing,
} from "@/lib/api/swap.api";
import { ApiError } from "@/lib/api/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const errMsg = (e: unknown, fallback: string) =>
  e instanceof ApiError ? e.message : fallback;

const schema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(120),
  category: z.enum(SWAP_CATEGORIES),
  description: z.string().trim().max(1000),
  wanted: z.string().trim().max(200),
  location: z.string().trim().max(120),
});
type FormValues = z.infer<typeof schema>;

export default function SwapShopPage() {
  const { can } = usePermissions();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["swap", q, category],
    queryFn: async () => (await swapApi.list({ q, category })).items,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["swap"] });

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[var(--fg)]">Swap shop</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Swap tools, seedlings and household items with fellow members.
          </p>
        </div>
        {can("swap:create") && (
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Close" : "List an item"}
          </Button>
        )}
      </div>

      {showForm && (
        <NewListing
          onDone={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      <div className="relative mt-4">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search items…"
          className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-3 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
        />
      </div>

      <div className="-mx-4 mt-3 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {["", ...SWAP_CATEGORIES].map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "min-h-[36px] shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium focus-ring",
                category === c
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-muted)]",
              )}
            >
              {c || "All"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <Card className="mt-4">
          <CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">
            <Repeat className="mx-auto h-8 w-8 text-[var(--fg-subtle)]" aria-hidden />
            <p className="mt-2">Nothing listed yet. Be the first to list an item.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.map((l) => (
            <ListingCard key={l.id} listing={l} canAsk={can("swap:create")} onChanged={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ New listing ------------------------------ */

function NewListing({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", category: "Tools", description: "", wanted: "", location: "" },
  });

  const onSubmit = async (v: FormValues) => {
    setBusy(true);
    try {
      await swapApi.create({
        title: v.title,
        category: v.category,
        ...(v.description ? { description: v.description } : {}),
        ...(v.wanted ? { wanted: v.wanted } : {}),
        ...(v.location ? { location: v.location } : {}),
      });
      toast.success("Your item is listed.");
      onDone();
    } catch (e) {
      toast.error(errMsg(e, "Could not list the item."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Input label="What are you offering?" error={errors.title?.message} {...register("title")} />
          <label className="block text-sm font-medium">
            Category
            <select
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2.5 text-base"
              {...register("category")}
            >
              {SWAP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Details (optional)
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2.5 text-base"
              {...register("description")}
            />
          </label>
          <Input label="What would you like in return? (optional)" {...register("wanted")} />
          <Input label="Where can it be collected? (optional)" {...register("location")} />
          <Button type="submit" fullWidth loading={busy}>
            List item
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

/* ------------------------------ Listing card ------------------------------ */

function ListingCard({
  listing,
  canAsk,
  onChanged,
}: {
  listing: SwapListing;
  canAsk: boolean;
  onChanged: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState("");
  const [showRequests, setShowRequests] = useState(false);

  const ask = useMutation({
    mutationFn: () => swapApi.request(listing.id, message.trim() || undefined),
    onSuccess: () => {
      toast.success("Request sent. The owner will contact you.");
      setAsking(false);
      setMessage("");
      onChanged();
    },
    onError: (e) => toast.error(errMsg(e, "Could not send your request.")),
  });
  const done = useMutation({
    mutationFn: () => swapApi.setStatus(listing.id, "COMPLETED"),
    onSuccess: () => {
      toast.success("Marked as swapped.");
      onChanged();
    },
    onError: (e) => toast.error(errMsg(e, "Could not update the listing.")),
  });
  const remove = useMutation({
    mutationFn: () => swapApi.remove(listing.id),
    onSuccess: () => {
      toast.success("Listing removed.");
      onChanged();
    },
    onError: (e) => toast.error(errMsg(e, "Could not remove the listing.")),
  });

  const requests = useQuery({
    queryKey: ["swap", "requests", listing.id],
    queryFn: async () => (await swapApi.requests(listing.id)).items,
    enabled: showRequests && listing.mine,
  });

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--fg)]">{listing.title}</p>
            <p className="text-xs text-[var(--fg-subtle)]">
              {listing.mine ? "You" : listing.ownerName}
              {listing.location ? ` · ${listing.location}` : ""}
            </p>
          </div>
          <Badge tone="primary">{listing.category}</Badge>
        </div>

        {listing.description && (
          <p className="mt-2 text-sm text-[var(--fg-muted)]">{listing.description}</p>
        )}
        {listing.wanted && (
          <p className="mt-1 text-xs text-[var(--fg-subtle)]">Looking for: {listing.wanted}</p>
        )}

        {listing.mine ? (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowRequests((v) => !v)}>
                Requests ({listing.requestCount})
              </Button>
              <Button size="sm" onClick={() => done.mutate()} disabled={done.isPending}>
                Mark swapped
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm("Remove this listing?")) remove.mutate();
                }}
                disabled={remove.isPending}
              >
                Remove
              </Button>
            </div>
            {showRequests &&
              (requests.isLoading ? (
                <Skeleton className="h-12" />
              ) : requests.data && requests.data.length > 0 ? (
                <ul className="space-y-2">
                  {requests.data.map((r) => (
                    <li key={r.id} className="rounded-lg bg-[var(--bg-muted)] p-2 text-sm">
                      <p className="font-medium text-[var(--fg)]">
                        {r.requesterName}
                        {r.phone ? ` · ${r.phone}` : ""}
                      </p>
                      {r.message && <p className="text-[var(--fg-muted)]">{r.message}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--fg-muted)]">No requests yet.</p>
              ))}
          </div>
        ) : canAsk ? (
          asking ? (
            <div className="mt-3 space-y-2">
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Say what you can offer in return (optional)"
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-base"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => ask.mutate()} loading={ask.isPending}>
                  Send request
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAsking(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <Button
                size="sm"
                variant={listing.requested ? "outline" : "secondary"}
                onClick={() => setAsking(true)}
              >
                {listing.requested ? "Requested — edit" : "I’m interested"}
              </Button>
            </div>
          )
        ) : null}
      </CardBody>
    </Card>
  );
}
