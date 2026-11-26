"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { AddMemberForm } from "@/components/members/AddMemberForm";

export default function AddMemberPage() {
  const { can } = usePermissions();

  if (!can("members:create")) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-[var(--fg-subtle)]" aria-hidden />
        <h1 className="mt-3 text-xl font-semibold">Not allowed</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Only administrators can register members.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-6">
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to members
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Add a member</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--fg-muted)]">
        Register someone directly, without an application. They receive an email to set
        their own password.
      </p>
      <AddMemberForm />
    </div>
  );
}
