"use client";

import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { cn } from "@/lib/utils";

export function SyncStatusIndicator() {
  const { pending, online, flush } = useOfflineQueue();

  return (
    <button
      type="button"
      onClick={() => void flush()}
      disabled={!online || pending === 0}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors focus-ring",
        !online
          ? "bg-[color:var(--danger)]/15 text-[var(--danger)]"
          : pending > 0
            ? "bg-[color:var(--warning)]/15 text-[var(--warning)]"
            : "bg-[color:var(--success)]/15 text-[var(--success)]",
        (pending === 0 || !online) && "cursor-default",
      )}
      aria-live="polite"
    >
      {!online ? (
        <>
          <CloudOff className="h-3.5 w-3.5" /> Offline
        </>
      ) : pending > 0 ? (
        <>
          <RefreshCw className="h-3.5 w-3.5" /> {pending} pending
        </>
      ) : (
        <>
          <Cloud className="h-3.5 w-3.5" /> Synced
        </>
      )}
    </button>
  );
}
