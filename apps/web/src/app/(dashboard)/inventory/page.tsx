"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, Plus, Trash2 } from "lucide-react";
import { inventoryApi, type InventoryItem, type InventoryLoan } from "@/lib/api/inventory.api";
import { ApiError } from "@/lib/api/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

const errMsg = (e: unknown, fallback: string) =>
  e instanceof ApiError ? e.message : fallback;

export default function InventoryPage() {
  const { can } = usePermissions();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["inventory"] });

  const items = useQuery({
    queryKey: ["inventory", "items"],
    queryFn: async () => (await inventoryApi.items()).items,
  });
  const mine = useQuery({
    queryKey: ["inventory", "mine"],
    queryFn: async () => (await inventoryApi.myLoans()).items,
  });
  const open = useQuery({
    queryKey: ["inventory", "open"],
    queryFn: async () => (await inventoryApi.openLoans()).items,
    enabled: can("inventory:approve"),
  });

  const decide = useMutation({
    mutationFn: (v: { id: string; decision: "APPROVED" | "REJECTED" }) =>
      inventoryApi.decide(v.id, v.decision),
    onSuccess: () => {
      toast.success("Updated.");
      refresh();
    },
    onError: (e) => toast.error(errMsg(e, "Could not update the request.")),
  });
  const giveBack = useMutation({
    mutationFn: (id: string) => inventoryApi.markReturned(id),
    onSuccess: () => {
      toast.success("Marked as returned.");
      refresh();
    },
    onError: (e) => toast.error(errMsg(e, "Could not mark as returned.")),
  });
  const remove = useMutation({
    mutationFn: (id: string) => inventoryApi.removeItem(id),
    onSuccess: () => {
      toast.success("Item removed.");
      refresh();
    },
    onError: (e) => toast.error(errMsg(e, "Could not remove the item.")),
  });

  const requests = (open.data ?? []).filter((l) => l.status === "REQUESTED");
  const checkedOut = (open.data ?? []).filter((l) => l.status === "APPROVED");

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[var(--fg)]">Inventory</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Tools and equipment owned by the organisation.
          </p>
        </div>
        {can("inventory:manage") && (
          <Link href="/inventory/new">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </Link>
        )}
      </div>

      {/* ---------- Approvals ---------- */}
      {can("inventory:approve") && (
        <section className="mt-6">
          <h2 className="mb-2 text-base font-semibold text-[var(--fg)]">
            Requests waiting ({requests.length})
          </h2>
          {requests.length === 0 ? (
            <p className="text-sm text-[var(--fg-muted)]">No requests waiting.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((l) => (
                <LoanRow key={l.id} loan={l}>
                  <Button
                    size="sm"
                    onClick={() => decide.mutate({ id: l.id, decision: "APPROVED" })}
                    disabled={decide.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decide.mutate({ id: l.id, decision: "REJECTED" })}
                    disabled={decide.isPending}
                  >
                    Reject
                  </Button>
                </LoanRow>
              ))}
            </ul>
          )}

          {checkedOut.length > 0 && (
            <>
              <h2 className="mb-2 mt-5 text-base font-semibold text-[var(--fg)]">
                Currently checked out ({checkedOut.length})
              </h2>
              <ul className="space-y-2">
                {checkedOut.map((l) => (
                  <LoanRow key={l.id} loan={l}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => giveBack.mutate(l.id)}
                      disabled={giveBack.isPending}
                    >
                      Mark returned
                    </Button>
                  </LoanRow>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* ---------- Equipment ---------- */}
      <h2 className="mb-2 mt-6 text-base font-semibold text-[var(--fg)]">Equipment</h2>
      {items.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !items.data || items.data.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-sm text-[var(--fg-muted)]">
            <Package className="mx-auto h-8 w-8 text-[var(--fg-subtle)]" aria-hidden />
            <p className="mt-2">No equipment has been added yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.data.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              canRequest={can("inventory:checkout")}
              canManage={can("inventory:manage")}
              onRequested={refresh}
              onRemove={() => {
                if (confirm(`Remove “${it.name}” from the inventory?`)) remove.mutate(it.id);
              }}
            />
          ))}
        </div>
      )}

      {/* ---------- My requests ---------- */}
      {mine.data && mine.data.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-base font-semibold text-[var(--fg)]">My requests</h2>
          <ul className="space-y-2">
            {mine.data.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-sm"
              >
                <span className="min-w-0 truncate">
                  {l.quantity} × {l.itemName}
                </span>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: InventoryLoan["status"] }) {
  const tone =
    status === "APPROVED" ? "success" : status === "REQUESTED" ? "primary" : "neutral";
  const label =
    status === "APPROVED" ? "checked out" : status.toLowerCase();
  return <Badge tone={tone}>{label}</Badge>;
}

function LoanRow({ loan, children }: { loan: InventoryLoan; children: React.ReactNode }) {
  return (
    <li className="rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
      <p className="text-sm font-semibold text-[var(--fg)]">
        {loan.quantity} × {loan.itemName}
      </p>
      <p className="text-xs text-[var(--fg-subtle)]">
        {loan.requesterName}
        {loan.purpose ? ` · ${loan.purpose}` : ""}
      </p>
      <div className="mt-2 flex gap-2">{children}</div>
    </li>
  );
}

function ItemCard({
  item,
  canRequest,
  canManage,
  onRequested,
  onRemove,
}: {
  item: InventoryItem;
  canRequest: boolean;
  canManage: boolean;
  onRequested: () => void;
  onRemove: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const [qty, setQty] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    try {
      await inventoryApi.request(item.id, {
        quantity: qty,
        ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
      });
      toast.success("Request sent for approval.");
      setAsking(false);
      setPurpose("");
      setQty(1);
      onRequested();
    } catch (e) {
      toast.error(errMsg(e, "Could not send the request."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--fg)]">{item.name}</p>
            <p className="text-xs text-[var(--fg-subtle)]">
              {item.category}
              {item.location ? ` · ${item.location}` : ""}
            </p>
          </div>
          <Badge tone={item.quantityAvailable > 0 ? "success" : "neutral"}>
            {item.quantityAvailable}/{item.quantityTotal} available
          </Badge>
        </div>
        {item.description && (
          <p className="mt-2 text-sm text-[var(--fg-muted)]">{item.description}</p>
        )}

        {asking ? (
          <div className="mt-3 space-y-2">
            <input
              type="number"
              min={1}
              max={item.quantityAvailable}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="w-24 rounded-lg border bg-transparent px-3 py-2 text-base"
              aria-label="Quantity"
            />
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What is it for?"
              maxLength={500}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-base"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={send} loading={busy}>
                Send request
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAsking(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            {canRequest && (
              <Button
                size="sm"
                variant="secondary"
                disabled={item.quantityAvailable < 1}
                onClick={() => setAsking(true)}
              >
                Request
              </Button>
            )}
            {canManage && (
              <Button size="sm" variant="outline" onClick={onRemove} aria-label={`Remove ${item.name}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
