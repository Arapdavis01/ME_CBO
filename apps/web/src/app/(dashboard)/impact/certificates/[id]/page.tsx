"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Printer } from "lucide-react";
import { impactApi } from "@/lib/api/impact.api";
import { ImpactCertificate } from "@/components/impact/ImpactCertificate";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["impact", "certificate", id],
    queryFn: async () => (await impactApi.certificate(id)).certificate,
  });

  if (isLoading || !data) {
    return (
      <div className="container-mobile py-5 sm:py-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container-mobile py-5 sm:py-8">
      <Link
        href="/impact/certificates"
        className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] no-print"
      >
        ← Certificates
      </Link>

      <div className="mt-3">
        <ImpactCertificate certificate={data} />
      </div>

      <div className="mt-5 flex flex-col gap-2 xs:flex-row no-print">
        <Button size="lg" fullWidth onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
        <Button
          size="lg"
          variant="secondary"
          fullWidth
          onClick={() => {
            if (navigator.share) {
              void navigator.share({
                title: data.title,
                text: "My ME_CBO impact certificate",
                url: window.location.href,
              });
            } else {
              void navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          Share
        </Button>
      </div>
    </div>
  );
}
