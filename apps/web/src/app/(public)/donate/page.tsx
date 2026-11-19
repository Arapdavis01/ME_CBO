import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DonationForm } from "@/components/finance/DonationForm";
import { Card, CardBody } from "@/components/ui/Card";
import { siteConfig } from "@/config/site";
import { ShieldCheck, Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Donate",
  description: "Support ME_CBO's tree planting, clean-ups, and community education in Mosoriot, Kenya.",
};

export default function DonatePage() {
  return (
    <>
      <SiteHeader />
      <main className="container-mobile py-6 sm:py-10">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              <Leaf className="h-3.5 w-3.5" aria-hidden />
              Every shilling plants trees
            </span>
            <h1 className="mt-3 text-[var(--fg)]">Support ME_CBO</h1>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Your donation funds seedlings, clean-up gear, and training for
              volunteers across Mosoriot.
            </p>
          </div>

          <Card className="mt-6">
            <CardBody>
              <DonationForm />
            </CardBody>
          </Card>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--fg-subtle)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Secure payments · Tax receipts available
          </div>

          <p className="mt-6 text-center text-xs text-[var(--fg-subtle)]">
            {siteConfig.contact.address} · {siteConfig.contact.phone}
          </p>
        </div>
      </main>
    </>
  );
}
