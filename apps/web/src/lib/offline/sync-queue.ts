"use client";

import { getDb } from "./db";
import type { ProofOfWorkPayload } from "@/types/events";
import { api } from "@/lib/api/client";

const MAX_ATTEMPTS = 5;

export async function enqueueProof(payload: ProofOfWorkPayload): Promise<number> {
  const db = getDb();
  return db.proofs.add({
    ...payload,
    attempts: 0,
    status: "pending",
  });
}

export async function pendingCount(): Promise<number> {
  const db = getDb();
  return db.proofs.where("status").anyOf("pending", "failed").count();
}

async function syncOne(item: { id: number } & ProofOfWorkPayload): Promise<void> {
  const db = getDb();
  await db.proofs.update(item.id, { status: "syncing" });
  try {
    await api.post("/events/proofs", {
      clientId: item.clientId,
      eventId: item.eventId,
      photoDataUrl: item.photoDataUrl,
      coords: item.coords,
      notes: item.notes,
      capturedAt: item.capturedAt,
    });
    await db.proofs.delete(item.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const current = await db.proofs.get(item.id);
    const attempts = (current?.attempts ?? 0) + 1;
    await db.proofs.update(item.id, {
      status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
      attempts,
      lastError: message,
    });
    throw err;
  }
}

/** Flush all pending proofs. Safe to call anytime; stops on first failure. */
export async function flushQueue(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) return { synced: 0, failed: 0 };
  const db = getDb();
  const items = await db.proofs.where("status").equals("pending").sortBy("capturedAt");
  let synced = 0;
  let failed = 0;
  for (const item of items) {
    try {
      await syncOne(item);
      synced++;
    } catch {
      failed++;
      break;
    }
  }
  return { synced, failed };
}

/** Register listeners: online event + periodic retry. */
export function startSyncLoop(onUpdate?: (pending: number) => void): () => void {
  let cancelled = false;

  const tick = async () => {
    if (cancelled) return;
    const { synced } = await flushQueue().catch(() => ({ synced: 0 }));
    if (synced > 0) {
      const n = await pendingCount();
      onUpdate?.(n);
    }
  };

  const onOnline = () => { void tick(); };
  window.addEventListener("online", onOnline);

  const interval = window.setInterval(() => { void tick(); }, 30_000);

  return () => {
    cancelled = true;
    window.removeEventListener("online", onOnline);
    window.clearInterval(interval);
  };
}
