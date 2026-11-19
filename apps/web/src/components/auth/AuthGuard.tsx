"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "idle" || status === "loading" || !isAuthenticated) {
    return (
      <div className="grid min-h-[60dvh] place-items-center px-4">
        <div className="flex items-center gap-2 text-[var(--fg-muted)]">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span className="text-sm">Checking your session…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
