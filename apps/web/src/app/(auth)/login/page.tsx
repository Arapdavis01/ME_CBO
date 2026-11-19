import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your ME_CBO account."
      footer={
        <>
          New here?{" "}
          <Link
            href="/apply"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            Apply for membership
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-[var(--fg-muted)] hover:text-[var(--fg)]">
          Forgot password?
        </Link>
        <Link href="/apply" className="text-[var(--fg-muted)] hover:text-[var(--fg)]">
          Request access
        </Link>
      </div>
    </AuthShell>
  );
}
