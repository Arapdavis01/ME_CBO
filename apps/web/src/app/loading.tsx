import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[var(--bg)]">
      <div className="flex items-center gap-2 text-[var(--fg-muted)]">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
