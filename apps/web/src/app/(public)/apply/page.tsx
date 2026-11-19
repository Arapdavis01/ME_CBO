import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MembershipApplicationForm } from "@/components/members/MembershipApplicationForm";

export const metadata: Metadata = {
  title: "Become a member",
  description: "Apply to join Mosoriot Environmental Community-Based Organization.",
};

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-mobile py-6 sm:py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-[var(--fg)]">Become a member</h1>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Tell us about yourself. We review every application personally.
          </p>
          <div className="mt-6">
            <MembershipApplicationForm />
          </div>
        </div>
      </main>
    </>
  );
}
