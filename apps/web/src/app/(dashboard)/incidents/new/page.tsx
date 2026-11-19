"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, MapPin, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCreateIncident } from "@/hooks/useIncidents";
import type { IncidentCategory, IncidentSeverity } from "@/types/incidents";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(5, "Short headline"),
  description: z.string().min(20, "Describe what you saw (20+ chars)"),
  location: z.string().min(2, "Where is it?"),
  category: z.enum(["ILLEGAL_DUMPING", "DEFORESTATION", "WATER_POLLUTION", "AIR_POLLUTION", "WILDLIFE", "OTHER"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});
type Values = z.infer<typeof schema>;

const MAX = 4 * 1024 * 1024;
function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(f);
  });
}

export default function NewIncidentPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { coords, locate, loading: locating, error: geoErr } = useGeolocation();
  const create = useCreateIncident();

  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      location: "Mosoriot",
      category: "ILLEGAL_DUMPING",
      severity: "MEDIUM",
    },
  });

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX) { toast.error("Photo too large (max 4 MB)."); return; }
    setPreview(await fileToDataUrl(f));
    if (!coords) void locate();
  };

  const onSubmit = async (values: Values) => {
    const point = coords ?? (await locate());
    if (!point) { toast.error("Location required."); return; }

    await create.mutateAsync({
      clientId: crypto.randomUUID(),
      category: values.category as IncidentCategory,
      severity: values.severity as IncidentSeverity,
      title: values.title,
      description: values.description,
      location: values.location,
      coords: point,
      photoDataUrl: preview ?? undefined,
    });
    router.replace("/incidents");
  };

  return (
    <div className="container-mobile py-5 sm:py-8">
      <h1 className="text-[var(--fg)]">Report an incident</h1>
      <Card className="mt-4">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <label
              htmlFor="incident-photo"
              className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-[var(--border)] bg-[var(--bg-muted)] p-4 text-center focus-ring"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="max-h-48 w-full rounded-[var(--radius-md)] object-cover" />
              ) : (
                <>
                  <Camera className="h-6 w-6 text-[var(--primary)]" aria-hidden />
                  <span className="text-sm font-medium text-[var(--fg)]">Take a photo</span>
                  <span className="text-xs text-[var(--fg-subtle)]">Shows reality better than words</span>
                </>
              )}
              <input
                ref={fileRef}
                id="incident-photo"
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={onPick}
              />
            </label>

            <Input label="Headline" placeholder="e.g. Dumping near river" error={errors.title?.message} {...register("title")} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">Description</label>
              <textarea
                rows={4}
                {...register("description")}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring"
                placeholder="What did you see? When? Any hazards?"
              />
              {errors.description && <p className="mt-1.5 text-sm text-[var(--danger)]">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">Category</label>
                <select {...register("category")} className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring">
                  <option value="ILLEGAL_DUMPING">Illegal dumping</option>
                  <option value="DEFORESTATION">Deforestation</option>
                  <option value="WATER_POLLUTION">Water pollution</option>
                  <option value="AIR_POLLUTION">Air pollution</option>
                  <option value="WILDLIFE">Wildlife</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--fg)]">Severity</label>
                <select {...register("severity")} className="w-full min-h-[44px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[16px] text-[var(--fg)] focus:border-[var(--accent)] focus-ring">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <Input label="Location (village / landmark)" error={errors.location?.message} {...register("location")} />

            <Button type="button" variant="secondary" fullWidth loading={locating} onClick={() => void locate()}>
              <MapPin className="h-4 w-4" />
              {coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Capture GPS"}
            </Button>
            {geoErr && <p className="text-xs text-[var(--danger)]">{geoErr}</p>}

            <Button type="submit" size="lg" fullWidth loading={create.isPending}>
              <UploadCloud className="h-4 w-4" /> Submit report
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
