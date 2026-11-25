// apps/web/src/components/announcements/NoticeBar.tsx
"use client";

import { AlertTriangle, Info, Wrench, X } from "lucide-react";
import type { AnnouncementKind } from "@/lib/api/announcements.api";

const TZ = "Africa/Nairobi";

function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short", day: "numeric", month: "short", timeZone: TZ,
  });
}
function time(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "numeric", minute: "2-digit", timeZone: TZ,
  });
}

/** "Wed 25 Nov, 10:00 pm – 12:00 am (EAT)" */
export function formatWindow(start: string | null, end: string | null): string | null {
  if (start && end) {
    return day(start) === day(end)
      ? `${day(start)}, ${time(start)} – ${time(end)} (EAT)`
      : `${day(start)}, ${time(start)} – ${day(end)}, ${time(end)} (EAT)`;
  }
  if (start) return `from ${day(start)}, ${time(start)} (EAT)`;
  if (end) return `until ${day(end)}, ${time(end)} (EAT)`;
  return null;
}

const STYLES: Record<AnnouncementKind, string> = {
  INFO: "bg-[var(--primary)] text-white",
  MAINTENANCE: "bg-amber-400 text-slate-900",
  WARNING: "bg-red-600 text-white",
};

const ICONS = { INFO: Info, MAINTENANCE: Wrench, WARNING: AlertTriangle } as const;

export function NoticeBar({
  kind,
  message,
  windowStart,
  windowEnd,
  onDismiss,
}: {
  kind: AnnouncementKind;
  message: string;
  windowStart: string | null;
  windowEnd: string | null;
  onDismiss?: () => void;
}) {
  const Icon = ICONS[kind];
  const when = formatWindow(windowStart, windowEnd);

  return (
    <div role="status" aria-live="polite" className={`no-print ${STYLES[kind]}`}>
      <div className="container-mobile flex items-start gap-3 py-2.5 text-sm">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p className="flex-1">
          {message}
          {when && <strong className="ml-1 font-semibold">Scheduled: {when}.</strong>}
        </p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss this notice"
            className="-m-1 rounded p-1 hover:bg-black/10 focus-ring"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
