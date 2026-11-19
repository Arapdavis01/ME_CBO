import { QrCheckinScanner } from "@/components/events/QrCheckinScanner";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CheckinPage({ params }: { params: { id: string } }) {
  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="mb-4 text-[var(--fg)]">Event check-in</h1>
      <Card>
        <CardHeader><CardTitle>Enter your code</CardTitle></CardHeader>
        <CardBody>
          <QrCheckinScanner eventId={params.id} />
          <p className="mt-3 text-xs text-[var(--fg-subtle)]">
            The code is printed on the event poster or shown by the field officer.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
