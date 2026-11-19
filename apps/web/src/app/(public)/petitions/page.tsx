import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PetitionsList } from "@/components/petitions/PetitionsList";

export const metadata: Metadata = {
  title: "Petitions",
  description: "Add your voice to Mosoriot environmental advocacy campaigns.",
};

export default function PetitionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-mobile py-6 sm:py-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[var(--fg)]">Petitions</h1>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">Add your voice. Every signature counts.</p>
          </div>
          <Link href="/petitions/new" className="text-sm font-semibold text-[var(--primary)] self-end">Start a petition</Link>
        </div>
        <div className="mt-6">
          <PetitionsList />
        </div>
      </main>
    </>
  );
}
