"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { incidentsApi } from "@/lib/api/incidents.api";
import { useResolveIncident } from "@/hooks/useIncidents";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { MapPin } from "lucide-react";

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = usePermissions();
  const { data, isLoading } = useQuery({
    queryKey: ["incidents", "detail", id],
    queryFn: async () => (await incidentsApi.detail(id)).incident,
  });
  const resolve = useResolveIncident();

  if (isLoading || !data) {
    return <div className="container-mobile py-5 sm:py-8"><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link href="/incidents" className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]">← Incidents</Link>
      <h1 className="mt-2 text-[var(--fg)]">{data.title}</h1>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone="warning">{data.severity.toLowerCase()}</Badge>
        <Badge tone={data.status === "RESOLVED" ? "success" : "neutral"}>{data.status.toLowerCase()}</Badge>
      </div>

      {data.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.photoUrl} alt="" className="mt-4 aspect-video w-full rounded-card object-cover" />
      )}

      <p className="mt-4 whitespace-pre-line text-sm text-[var(--fg-muted)]">{data.description}</p>

      <Card className="mt-4">
        <CardBody className="space-y-2 text-sm">
          <p className="inline-flex items-center gap-2 text-[var(--fg)]"><MapPin className="h-4 w-4 text-[var(--primary)]" /> {data.location} · {data.coords.lat.toFixed(4)}, {data.coords.lng.toFixed(4)}</p>
          <p className="text-[var(--fg-subtle)]">Reported {formatDate(data.reportedAt)} by {data.reportedBy}</p>
          {data.resolutionNote && <p className="text-[var(--fg-muted)]">Resolution: {data.resolutionNote}</p>}
        </CardBody>
      </Card>

      {can("incidents:resolve") && data.status === "OPEN" && (
        <div className="mt-4">
          <Button
            size="lg"
            fullWidth
            loading={resolve.isPending}
            onClick={() => {
              const note = window.prompt("Resolution note:") ?? "";
              if (note.trim()) resolve.mutate({ id: data.id, note });
            }}
          >
            Mark resolved
          </Button>
        </div>
      )}
    </div>
  );
}
