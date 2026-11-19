"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SecurityPage() {
  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="mb-4 text-[var(--fg)]">Security & MFA</h1>
      <Card>
        <CardHeader><CardTitle>Two-factor authentication</CardTitle></CardHeader>
        <CardBody className="text-sm text-[var(--fg-muted)]">
          MFA setup wizard arrives in a later batch. Core auth flow is live.
        </CardBody>
      </Card>
    </div>
  );
}
