"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, MapPin, Users, QrCode, Camera } from "lucide-react";
import { useEvent, useRsvp } from "@/hooks/useEvents";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);
  const rsvp = useRsvp(id);

  if (isLoading || !event) {
    return (
      <div className="grid place-items-center py-16 text-[var(--fg-muted)]">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      </div>
    );
  }

  const going = event.myRsvp === "GOING";

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link href="/events" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">
        ← All events
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone="primary">{event.category.toLowerCase()}</Badge>
        <Badge tone={event.status === "COMPLETED" ? "neutral" : "success"}>
          {event.status.toLowerCase()}
        </Badge>
        {going && <Badge tone="success">You&apos;re going</Badge>}
      </div>

      <h1 className="mt-2 text-[var(--fg)]">{event.title}</h1>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">{event.description}</p>

      <Card className="mt-4">
        <CardBody className="grid gap-2 text-sm text-[var(--fg)]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[var(--primary)]" aria-hidden />
            {formatDate(event.startsAt)} → {formatDate(event.endsAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--primary)]" aria-hidden />
            {event.location}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--primary)]" aria-hidden />
            {event.attending}/{event.capacity} attending
          </span>
        </CardBody>
      </Card>

      <div className="mt-4 grid gap-2 xs:grid-cols-2">
        <Button
          size="lg"
          variant={going ? "secondary" : "primary"}
          fullWidth
          loading={rsvp.isPending}
          onClick={() => rsvp.mutate(going ? "cancel" : "join")}
        >
          {going ? "Cancel RSVP" : "RSVP — I'm in"}
        </Button>
        <Link href={`/events/${id}/checkin`} className="xs:w-auto">
          <Button size="lg" variant="outline" fullWidth>
            <QrCode className="h-4 w-4" /> Check in
          </Button>
        </Link>
      </div>

      <div className="mt-4">
        <Link href={`/events/${id}/proof`}>
          <Button size="lg" variant="secondary" fullWidth>
            <Camera className="h-4 w-4" /> Upload proof of work
          </Button>
        </Link>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>What to bring</CardTitle></CardHeader>
        <CardBody className="text-sm text-[var(--fg-muted)]">
          Gloves, closed shoes, a reusable water bottle. ME_CBO provides gloves and bags on-site.
        </CardBody>
      </Card>
    </div>
  );
}
