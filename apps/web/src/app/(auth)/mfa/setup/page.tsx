"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth.store";

type StartResponse = { qrDataUrl: string; secret: string };
type ConfirmResponse = {
  user: Parameters<ReturnType<typeof useAuthStore.getState>["setUser"]>[0];
  backupCodes: string[];
};

const SETUP_KEY = "me_mfa_setup";

export default function MfaSetupPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [setupId, setSetupId] = useState<string | null>(null);
  const [qr, setQr] = useState<StartResponse | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<ConfirmResponse | null>(null);

  // Load the setup ticket created at login and fetch the QR code.
  useEffect(() => {
    const id = sessionStorage.getItem(SETUP_KEY);
    if (!id) {
      router.replace("/login");
      return;
    }
    setSetupId(id);
    api
      .post<StartResponse>("/auth/mfa/setup/ticket/start", { setupId: id })
      .then(setQr)
      .catch((err) => {
        sessionStorage.removeItem(SETUP_KEY);
        toast.error(
          err instanceof ApiError ? err.message : "Setup expired. Please sign in again.",
        );
        router.replace("/login");
      });
  }, [router]);

  const confirm = async () => {
    if (!setupId) return;
    setSubmitting(true);
    try {
      const res = await api.post<ConfirmResponse>("/auth/mfa/setup/ticket/confirm", {
        setupId,
        code: code.trim(),
      });
      sessionStorage.removeItem(SETUP_KEY);
      setDone(res);
      toast.success("Two-factor authentication enabled.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not verify the code.");
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    if (!done) return;
    setUser(done.user);
    router.replace("/dashboard");
  };

  /* Step 2: show backup codes once */
  if (done) {
    return (
      <AuthShell
        title="Save your backup codes"
        subtitle="Each code works once if you lose your authenticator. They will not be shown again."
        footer={null}
      >
        <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
          {done.backupCodes.map((c) => (
            <li key={c} className="rounded border border-[var(--border)] px-3 py-2 text-center">
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigator.clipboard.writeText(done.backupCodes.join("\n"))}
          >
            Copy codes
          </Button>
          <Button type="button" size="lg" fullWidth onClick={finish}>
            I have saved them — continue
          </Button>
        </div>
      </AuthShell>
    );
  }

  /* Step 1: scan QR and confirm a code */
  return (
    <AuthShell
      title="Set up two-factor authentication"
      subtitle="Required for admin accounts. Scan the QR code with an authenticator app, then enter the 6-digit code."
      footer={null}
    >
      {!qr ? (
        <p className="text-sm text-[var(--fg-muted)]">Preparing your setup…</p>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr.qrDataUrl}
            alt="Authenticator QR code"
            className="mx-auto h-48 w-48 rounded bg-white p-2"
          />
          <p className="break-all text-center text-xs text-[var(--fg-muted)]">
            Can’t scan? Enter this key manually:{" "}
            <span className="font-mono">{qr.secret}</span>
          </p>
          <Input
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
          />
          <Button
            type="button"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={code.length !== 6}
            onClick={confirm}
          >
            Verify and enable
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
