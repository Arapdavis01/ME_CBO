// apps/web/src/components/announcements/AnnouncementBanner.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { NoticeBar } from "./NoticeBar";
import { api } from "@/lib/api/client";
import type { AnnouncementKind } from "@/lib/api/announcements.api";

type PublicNotice = {
  id: string;
  kind: AnnouncementKind;
  message: string;
  windowStart: string | null;
  windowEnd: string | null;
  updatedAt: string;
};

const DISMISS_KEY = "me_notice_dismissed";
const REFRESH_MS = 5 * 60 * 1000;

function readDismissed(): string | null {
  try {
    return sessionStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

/**
 * Site-wide notice, shown on every page (website, sign-in, dashboard).
 * Admins control it from the dashboard. A visitor can close it; it comes
 * back only when the notice is changed.
 */
export function AnnouncementBanner() {
  const [notice, setNotice] = useState<PublicNotice | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ announcement: PublicNotice | null }>(
        "/public/announcement",
      );
      setNotice(data.announcement);
    } catch {
      /* offline, API asleep, or endpoint not deployed: keep what we have */
    }
  }, []);

  useEffect(() => {
    setDismissed(readDismissed());
    void load();
    const timer = setInterval(load, REFRESH_MS);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  if (!notice) return null;
  const token = `${notice.id}:${notice.updatedAt}`;
  if (dismissed === token) return null;

  return (
    <NoticeBar
      kind={notice.kind}
      message={notice.message}
      windowStart={notice.windowStart}
      windowEnd={notice.windowEnd}
      onDismiss={() => {
        try {
          sessionStorage.setItem(DISMISS_KEY, token);
        } catch {
          /* private mode */
        }
        setDismissed(token);
      }}
    />
  );
}
