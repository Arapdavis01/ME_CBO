"use client";

import Dexie, { type Table } from "dexie";
import type { ProofOfWorkPayload } from "@/types/events";

export type QueuedProof = ProofOfWorkPayload & {
  id: number; // auto-increment
  attempts: number;
  lastError?: string;
  status: "pending" | "syncing" | "failed";
};

class MECboDB extends Dexie {
  proofs!: Table<QueuedProof, number>;

  constructor() {
    super("me-cbo-offline");
    this.version(1).stores({
      proofs: "++id, eventId, status, capturedAt",
    });
  }
}

let _db: MECboDB | null = null;

export function getDb(): MECboDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is browser-only");
  }
  if (!_db) _db = new MECboDB();
  return _db;
}
