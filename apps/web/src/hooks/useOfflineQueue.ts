"use client";

import { useEffect, useState } from "react";
import { pendingCount, startSyncLoop, flushQueue } from "@/lib/offline/sync-queue";

export function useOfflineQueue() {
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const stop = startSyncLoop(setPending);
    void pendingCount().then(setPending);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      stop();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const flush = async () => {
    const res = await flushQueue();
    setPending(await pendingCount());
    return res;
  };

  return { pending, online, flush };
}
