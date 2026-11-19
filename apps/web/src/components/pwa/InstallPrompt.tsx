"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!evt || dismissed) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(var(--bottomnav-h)+env(safe-area-inset-bottom)+12px)] z-40 md:inset-x-auto md:right-4 md:bottom-4 md:w-80">
      <div className="me-slide-up rounded-card border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-geo-lg">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
            <Download className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--fg)]">Install ME_CBO</p>
            <p className="mt-0.5 text-xs text-[var(--fg-subtle)]">
              Add to your home screen for offline field use.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={async () => {
                  await evt.prompt();
                  await evt.userChoice;
                  setEvt(null);
                }}
              >
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="touch-target rounded-md text-[var(--fg-subtle)] focus-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
