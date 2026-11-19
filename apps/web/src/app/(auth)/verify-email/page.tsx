"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok" | "fail">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setState("fail");
      setMessage("Missing verification token");
      return;
    }
    api
      .post<{ ok: true }>("/members/verify-email", { token })
      .then(() => {
        setState("ok");
        toast.success("Email verified — you can now sign in");
      })
      .catch((err) => {
        setState("fail");
        setMessage(err instanceof ApiError ? err.message : "Verification failed");
      });
  }, [params]);

  return (
    <AuthShell title="Email verification" subtitle="Verifying your ME_CBO account">
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        {state === "loading" && <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" aria-hidden />}
        {state === "ok" && <CheckCircle2 className="h-12 w-12 text-[var(--success)]" aria-hidden />}
        {state === "fail" && <XCircle className="h-12 w-12 text-[var(--danger)]" aria-hidden />}
        <p className="text-sm text-[var(--fg-muted)]">
          {state === "loading" ? "Verifying…" : state === "ok" ? "Your email is verified. Welcome!" : message}
        </p>
        {state !== "loading" && (
          <Link href={state === "ok" ? "/login" : "/"} className="mt-2">
            <Button>{state === "ok" ? "Sign in" : "Go home"}</Button>
          </Link>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
