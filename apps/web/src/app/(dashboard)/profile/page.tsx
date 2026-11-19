"use client";

import { useAuth } from "@/hooks/useAuth";
import { roleLabel } from "@/lib/auth/permissions";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="mb-4 text-[var(--fg)]">My profile</h1>
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardBody className="space-y-2 text-sm">
          <p className="text-[var(--fg)]"><strong>Name:</strong> {user.fullName}</p>
          <p className="text-[var(--fg)]"><strong>Email:</strong> {user.email}</p>
          <p className="text-[var(--fg)]"><strong>Role:</strong> {roleLabel[user.role]}</p>
          <p className="text-[var(--fg)]"><strong>MFA:</strong> {user.mfaEnabled ? "Enabled" : "Not enabled"}</p>
        </CardBody>
      </Card>
      <div className="mt-4">
        <Link href="/profile/security">
          <Button variant="secondary" fullWidth>Security & MFA settings</Button>
        </Link>
      </div>
    </div>
  );
}
