"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, MapPin, UploadCloud, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { enqueueProof } from "@/lib/offline/sync-queue";
import { eventsApi } from "@/lib/api/events.api";
import { ApiError } from "@/lib/api/client";

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function ProofOfWorkUploader({ eventId }: { eventId: string }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { coords, loading: locating, error: geoError, locate } = useGeolocation();
  const { online, flush } = useOfflineQueue();
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Photo is too large (max 4 MB). Try again.");
      return;
    }
    setPreview(await fileToDataUrl(file));
    if (!coords) void locate();
  };

  const submit = async () => {
    if (!preview) {
      toast.error("Attach a geotagged photo first.");
      return;
    }
    const point = coords ?? (await locate());
    if (!point) {
      toast.error("Location required for proof of work.");
      return;
    }

    const payload = {
      clientId: crypto.randomUUID(),
      eventId,
      photoDataUrl: preview,
      coords: point,
      notes: notes.trim() || undefined,
      capturedAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      if (online) {
        await eventsApi.uploadProof(payload);
        toast.success("Proof submitted. Thank you!");
      } else {
        await enqueueProof(payload);
        toast.success("Saved offline. It will upload when you reconnect.");
        void flush();
      }
      setPreview(null);
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      // offline-safe fallback: queue it
      await enqueueProof(payload);
      const msg = err instanceof ApiError ? err.message : "Network issue — saved locally.";
      toast.warning(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!online && (
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--warning)]/15 p-3 text-sm text-[var(--warning)]">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
          You&apos;re offline. Proof will be saved and uploaded later.
        </div>
      )}

      <div>
        <label
          htmlFor="proof-photo"
          className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-[var(--border)] bg-[var(--bg-muted)] p-4 text-center focus-ring"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Proof preview"
              className="max-h-56 w-full rounded-[var(--radius-md)] object-cover"
            />
          ) : (
            <>
              <Camera className="h-7 w-7 text-[var(--primary)]" aria-hidden />
              <span className="text-sm font-medium text-[var(--fg)]">
                Take / choose a photo
              </span>
              <span className="text-xs text-[var(--fg-subtle)]">
                Geotagged photos help verify field work
              </span>
            </>
          )}
          <input
            ref={fileRef}
            id="proof-photo"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={onPick}
          />
        </label>
      </div>

      <div>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          loading={locating}
          onClick={() => void locate()}
        >
          <MapPin className="h-4 w-4" />
          {coords
            ? `Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
            : "Capture location"}
        </Button>
        {geoError && <p className="mt-1 text-xs text-[var(--danger)]">{geoError}</p>}
      </div>

      <Input
        label="Notes (optional)"
        placeholder="e.g. 30 seedlings planted along the river"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button size="lg" fullWidth loading={submitting} onClick={() => void submit()}>
        <UploadCloud className="h-4 w-4" />
        Submit proof
      </Button>
    </div>
  );
}
