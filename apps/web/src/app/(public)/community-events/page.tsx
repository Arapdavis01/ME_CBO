// apps/web/src/app/(public)/community-events/page.tsx
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EventCard } from "@/components/public/EventCard";
import { getPublicEvents } from "@/lib/public/public.api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming clean-ups, tree planting days and community meetings in Mosoriot.",
};

export default async function CommunityEventsPage() {
  const { upcoming, past } = await getPublicEvents();

  return (
    <>
      <SiteHeader />
      <main className="container-mobile py-10 sm:py-14">
        <h1 className="text-[var(--fg)]">Events</h1>
        <p className="mt-2 max-w-2xl text-[var(--fg-muted)]">
          Join us in the field. Members can sign in to reserve a place.
        </p>

        <section className="mt-10" aria-labelledby="upcoming">
          <h2 id="upcoming" className="text-[var(--fg)]">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 rounded-xl border border-[var(--border)] p-6 text-[var(--fg-muted)]">
              No events are scheduled right now. Please check back soon.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section className="mt-12" aria-labelledby="past">
            <h2 id="past" className="text-[var(--fg)]">Recent events</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
