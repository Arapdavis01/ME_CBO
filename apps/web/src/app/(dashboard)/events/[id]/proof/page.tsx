import { ProofOfWorkUploader } from "@/components/events/ProofOfWorkUploader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { SyncStatusIndicator } from "@/components/pwa/SyncStatusIndicator";

export default function ProofPage({ params }: { params: { id: string } }) {
  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="mb-2 text-[var(--fg)]">Proof of work</h1>
      <p className="mb-4 text-sm text-[var(--fg-muted)]">
        Upload a photo with GPS location. Works offline — we&apos;ll sync when you&apos;re back online.
      </p>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Field proof</CardTitle>
          <SyncStatusIndicator />
        </CardHeader>
        <CardBody>
          <ProofOfWorkUploader eventId={params.id} />
        </CardBody>
      </Card>
    </div>
  );
}
