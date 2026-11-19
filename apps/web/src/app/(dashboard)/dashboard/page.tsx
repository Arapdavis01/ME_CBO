"use client";

import Link from "next/link";
import { CalendarDays, Leaf, TreePine, Recycle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { roleLabel } from "@/lib/auth/permissions";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container-mobile py-5 sm:py-8">
      <div className="mb-6">
        <h1 className="text-[var(--fg)]">
          Karibu, {user?.fullName?.split(" ")[0] ?? "friend"} 🌿
        </h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          {user ? roleLabel[user.role] : ""} · Here&apos;s your impact at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Trees" value="128" hint="Lifetime" icon={TreePine} />
        <StatCard label="Waste" value="42 kg" hint="Collected" icon={Recycle} tone="leaf" />
        <StatCard label="Events" value="9" hint="Attended" icon={CalendarDays} tone="earth" />
        <StatCard label="Hours" value="64" hint="Volunteered" icon={Leaf} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Upcoming events</CardTitle>
            <Link href="/events" className="text-sm font-semibold text-[var(--primary)]">
              View all
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {[
              { title: "Riverbank clean-up", date: "Sat · 8:00 AM", place: "Mosoriot River" },
              { title: "Tree planting drive", date: "Sun · 7:30 AM", place: "Kapsabet Road" },
            ].map((e) => (
              <div
                key={e.title}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--fg)]">{e.title}</p>
                  <p className="text-xs text-[var(--fg-subtle)]">{e.date} · {e.place}</p>
                </div>
                <Link href="/events">
                  <Button size="sm" variant="outline">RSVP</Button>
                </Link>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-2 xs:grid-cols-2">
            <Link href="/impact"><Button variant="secondary" fullWidth>Log impact</Button></Link>
            <Link href="/incidents/new"><Button variant="secondary" fullWidth>Report incident</Button></Link>
            <Link href="/swap-shop"><Button variant="secondary" fullWidth>Swap shop</Button></Link>
            <Link href="/learning"><Button variant="secondary" fullWidth>Learning hub</Button></Link>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/impact">
          <Button fullWidth size="lg">
            See my full impact <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
