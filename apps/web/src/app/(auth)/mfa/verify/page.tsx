import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { MfaVerifyForm } from "@/components/auth/MfaVerifyForm";

export const metadata: Metadata = { title: "Two-factor verification" };

export default function MfaVerifyPage() {
  return (
    <AuthShell
      title="Two-factor verification"
      subtitle="Enter the 6-digit code from your authenticator app."
    >
      <MfaVerifyForm />
    </AuthShell>
  );
}
