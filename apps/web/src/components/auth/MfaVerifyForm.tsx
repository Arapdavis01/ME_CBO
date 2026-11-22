"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";
import { safeNext } from "@/lib/auth/next";

const LENGTH = 6;

export function MfaVerifyForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [useBackup, setUseBackup] = useState(false);
  const [backup, setBackup] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const challengeId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("me_mfa_challenge") ?? ""
      : "";

  useEffect(() => {
    if (!challengeId) router.replace("/login");
  }, [challengeId, router]);

  const setDigit = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = clean;
      return next;
    });
    if (clean && idx < LENGTH - 1) inputsRef.current[idx + 1]?.focus();
  };

  const onKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < LENGTH - 1)
      inputsRef.current[idx + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    const arr = Array(LENGTH).fill("");
    text.split("").forEach((c, i) => (arr[i] = c));
    setDigits(arr);
    inputsRef.current[Math.min(text.length, LENGTH - 1)]?.focus();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = useBackup ? backup.trim() : digits.join("");
    if (useBackup ? code.length < 6 : code.length !== LENGTH) {
      toast.error(useBackup ? "Enter your backup code" : "Enter all 6 digits");
      return;
    }
    setSubmitting(true);
    try {
      const { user } = await authApi.verifyMfa({ challengeId, code });
      sessionStorage.removeItem("me_mfa_challenge");
      queryClient.setQueryData(["auth", "me"], user);
      setUser(user);
      toast.success("Verified. Welcome!");
      const next = safeNext(
        new URLSearchParams(window.location.search).get("next"),
      );
      router.replace(next);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 429
            ? "Too many attempts. Wait a moment."
            : err.message
          : "Verification failed.";
      toast.error(msg);
      setDigits(Array(LENGTH).fill(""));
      setBackup("");
      if (!useBackup) inputsRef.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden />
        <p className="text-sm text-[var(--fg-muted)]">
          {useBackup
            ? "Enter one of the backup codes you saved when you set up two-factor authentication. Each code works once."
            : "Open your authenticator app and enter the 6-digit code for ME_CBO."}
        </p>
      </div>

      {useBackup ? (
        <Input
          label="Backup code"
          autoComplete="off"
          autoCapitalize="none"
          value={backup}
          onChange={(e) => setBackup(e.target.value)}
          placeholder="Your backup code"
        />
      ) : (
        <div className="flex items-center justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={onPaste}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Digit ${i + 1} of ${LENGTH}`}
              className="h-14 w-full max-w-[56px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] text-center text-2xl font-bold text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
            />
          ))}
        </div>
      )}

      <Button type="submit" size="lg" fullWidth loading={submitting}>
        Verify
      </Button>

      <div className="text-center text-sm text-[var(--fg-muted)]">
        <button
          type="button"
          onClick={() => setUseBackup((v) => !v)}
          className="font-semibold text-[var(--primary)] hover:underline focus-ring rounded"
        >
          {useBackup ? "Use my authenticator app" : "Use a backup code instead"}
        </button>
      </div>
    </form>
  );
}
