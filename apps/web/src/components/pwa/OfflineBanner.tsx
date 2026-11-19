"use client";

import { WifiOff } from "lucide-react";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";

export function OfflineBanner() {
  const { online, pending } = useOfflineQueue();
  if (online) return null;
  return (
    <div className="sticky top-[var(--header-h)] z-30 flex items-center gap-2 bg-[color:var(--warning)]/15 px-4 py-2 text-xs text-[var(--warning)] no-print">
      <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Offline — {pending > 0 ? `${pending} upload(s) queued.` : "changes will sync later."}
    </div>
  );
}
