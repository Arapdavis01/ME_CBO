"use client";

import Dexie, { type Table } from "dexie";
import type { ProofOfWorkPayload } from "@/types/events";
import type { CreateIncidentPayload } from "@/types/incidents";

export type QueuedProof = ProofOfWorkPayload & {
  id: number;
  attempts: number;
  lastError?: string;
  status: "pending" | "syncing" | "failed";
};

export type QueuedIncident = CreateIncidentPayload & {
  id: number;
  attempts: number;
  lastError?: string;
  status: "pending" | "syncing" | "failed";
  capturedAt: string;
};

class MECboDB extends Dexie {
  proofs!: Table<QueuedProof, number>;
  incidents!: Table<QueuedIncident, number>;

  constructor() {
    super("me-cbo-offline");
    this.version(1).stores({
      proofs: "++id, eventId, status, capturedAt",
    });
    this.version(2).stores({
      proofs: "++id, eventId, status, capturedAt",
      incidents: "++id, category, status, capturedAt",
    });
  }
}

let _db: MECboDB | null = null;

export function getDb(): MECboDB {
  if (typeof window === "undefined") throw new Error("IndexedDB is browser-only");
  if (!_db) _db = new MECboDB();
  return _db;
}
