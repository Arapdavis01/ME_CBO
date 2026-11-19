"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook for Sentry/observability later
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--bg)] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-[var(--fg)]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          We hit a snag loading this page. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-2 xs:flex-row xs:justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </div>
    </main>
  );
}
