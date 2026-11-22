"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/auth/permissions";
import { authApi } from "@/lib/api/auth.api";

type Props = {
  children: React.ReactNode;
  /** Optional: the user must hold this permission to see the page. */
  permission?: Permission;
  /** Optional: the user must hold at least one of these permissions. */
  anyOf?: Permission[];
};

/**
 * Client-side gate. The API enforces the same rules on every request,
 * so this is a UX layer, not the security boundary.
 */
export function AuthGuard({ children, permission, anyOf }: Props) {
  const { status, isAuthenticated } = useAuth();
  const { can, canAny } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const redirecting = useRef(false);

  useEffect(() => {
    if (status !== "unauthenticated" || redirecting.current) return;
    redirecting.current = true;

    void (async () => {
      // Clear any invalid cookies first. Otherwise the middleware would send
      // a stale cookie holder from /login straight back to /dashboard (a loop).
      try {
        await authApi.logout();
      } catch {
        /* nothing to clear, or API unreachable */
      }
      const next =
        pathname && pathname !== "/login"
          ? `?next=${encodeURIComponent(pathname)}`
          : "";
      router.replace(`/login${next}`);
    })();
  }, [status, pathname, router]);

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

  const allowed =
    (!permission || can(permission)) && (!anyOf || canAny(anyOf));

  if (!allowed) {
    return (
      <div className="grid min-h-[60dvh] place-items-center px-4">
        <div className="max-w-sm text-center">
          <ShieldAlert
            className="mx-auto h-8 w-8 text-[var(--fg-subtle)]"
            aria-hidden
          />
          <h1 className="mt-3 text-lg font-semibold text-[var(--fg)]">
            You don&apos;t have access to this page
          </h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Your role doesn&apos;t include this section. If you think this is a
            mistake, contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
