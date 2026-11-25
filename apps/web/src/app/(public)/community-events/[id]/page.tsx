// apps/web/src/app/(public)/community-events/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { getPublicEvent } from "@/lib/public/public.api";
import { CATEGORY_LABELS, formatRange, paragraphs } from "@/lib/public/format";

export const revalidate = 60;

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getPublicEvent(params.id);
  return e ? { title: e.title, description: e.description.slice(0, 160) } : { title: "Event not found" };
}

export default async function EventPage({ params }: Props) {
  const event = await getPublicEvent(params.id);
  if (!event) notFound();
  const finished = event.status === "COMPLETED" || new Date(event.endsAt) < new Date();

  return (
    <>
      <SiteHeader />
      <main>
        {event.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImageUrl} alt="" className="h-56 w-full object-cover sm:h-80" />
        )}
        <article className="container-mobile mx-auto max-w-3xl py-10 sm:py-14">
          <Link href="/community-events" className="text-sm underline">← All events</Link>
          <span className="mt-4 block w-fit rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
            {CATEGORY_LABELS[event.category]}
            {event.status === "ONGOING" ? " · Happening now" : finished ? " · Finished" : ""}
          </span>
          <h1 className="mt-3 text-[var(--fg)]">{event.title}</h1>

          <ul className="mt-4 space-y-2 text-[var(--fg-muted)]">
            <li className="flex gap-2"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />{formatRange(event.startsAt, event.endsAt)}</li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <span>
                {event.location}{" "}
                <a
                  className="underline"
                  href={`https://www.google.com/maps?q=${event.lat},${event.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on map
                </a>
              </span>
            </li>
            <li className="flex gap-2"><Users className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />Up to {event.capacity} participants</li>
          </ul>

          <div className="mt-8 space-y-4">
            {paragraphs(event.description).map((para, i) => <p key={i}>{para}</p>)}
          </div>

          {!finished && (
            <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-5">
              <h2 className="text-[var(--fg)]">Take part</h2>
              <p className="mt-1 text-sm text-[var(--fg-muted)]">
                Members sign in to reserve a place. Not a member yet? Apply to join.
              </p>
              <div className="mt-4 flex flex-col gap-3 xs:flex-row">
                <Link href={`/login?next=${encodeURIComponent(`/events/${event.id}`)}`}>
                  <Button size="lg" fullWidth>Sign in to reserve</Button>
                </Link>
                <Link href="/apply"><Button size="lg" variant="outline" fullWidth>Become a member</Button></Link>
              </div>
            </div>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
