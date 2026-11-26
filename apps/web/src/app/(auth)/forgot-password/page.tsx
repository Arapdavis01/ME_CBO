// apps/web/src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth.api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await authApi.requestPasswordReset(clean);
      setSentTo(clean);
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(
        (err as { status?: number })?.status === 429
          ? "Too many requests. Please wait a minute and try again."
          : "We could not send the request. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo height={72} href="/" priority />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-sm sm:p-8">
          {sentTo ? (
            <div role="status" className="space-y-4 text-center">
              <MailCheck
                className="mx-auto h-10 w-10 text-[var(--primary)]"
                aria-hidden
              />
              <h1 className="text-xl font-semibold text-[var(--fg)]">
                Check your email
              </h1>
              <p className="text-sm text-[var(--fg-muted)]">
                If an account exists for <strong>{sentTo}</strong>, a password
                reset link is on its way. It expires in 30 minutes. Check your
                spam folder if you do not see it.
              </p>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setSentTo(null)}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-[var(--fg)]">
                Forgot your password?
              </h1>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                Enter the email you registered with and we will send you a link
                to set a new password.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error ?? undefined}
                />
                <Button
                  type="submit"
                  fullWidth
                  loading={busy}
                  disabled={busy || !email.trim()}
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-[var(--primary)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
