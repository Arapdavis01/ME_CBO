import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Inventory" };

/**
 * Placeholder until the inventory module (equipment list, check-out and
 * approvals) is built. Replace this file when the backend is ready.
 */
export default function InventoryPage() {
  return (
    <div className="container-mobile py-10 sm:py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--bg-muted)] text-[var(--primary)]">
          <Package className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-[var(--fg)]">
          Inventory is coming soon
        </h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Equipment tracking, check-out and approvals are being set up. Check
          back shortly.
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
