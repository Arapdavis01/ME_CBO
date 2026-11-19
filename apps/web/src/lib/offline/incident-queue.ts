"use client";

import { getDb } from "./db";
import type { CreateIncidentPayload } from "@/types/incidents";
import { api } from "@/lib/api/client";

/** Extends the Dexie DB declared in Batch 3 with an incidents table. */
export async function enqueueIncident(payload: CreateIncidentPayload): Promise<number> {
  const db = getDb();
  // Table added via DB version bump below
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).incidents.add({
    ...payload,
    status: "pending",
    attempts: 0,
    capturedAt: new Date().toISOString(),
  });
}

export async function flushIncidents(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) return { synced: 0, failed: 0 };
  const db = getDb() as unknown as {
    incidents: {
      where: (key: string) => { equals: (v: string) => { toArray: () => Promise<Array<{ id: number } & CreateIncidentPayload>> } };
      delete: (id: number) => Promise<void>;
      update: (id: number, patch: Record<string, unknown>) => Promise<number>;
    };
  };
  const rows = await db.incidents.where("status").equals("pending").toArray();
  let synced = 0;
  let failed = 0;
  for (const r of rows) {
    try {
      await api.post("/incidents", {
        clientId: r.clientId,
        category: r.category,
        severity: r.severity,
        title: r.title,
        description: r.description,
        location: r.location,
        coords: r.coords,
        photoDataUrl: r.photoDataUrl,
      });
      await db.incidents.delete(r.id);
      synced++;
    } catch {
      failed++;
      break;
    }
  }
  return { synced, failed };
}
