"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarPlus, LocateFixed, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const CATEGORIES = ["CLEANUP", "PLANTING", "AWARENESS", "MEETING"] as const;

const schema = z
  .object({
    title: z.string().trim().min(4, "At least 4 characters").max(120),
    description: z.string().trim().min(20, "Describe the event (at least 20 characters)").max(2000),
    location: z.string().trim().min(2, "Enter the venue"),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    startsAt: z.string().min(1, "Choose a start time"),
    endsAt: z.string().min(1, "Choose an end time"),
    category: z.enum(CATEGORIES),
    capacity: z.coerce.number().int().min(1).max(5000),
    coverImageUrl: z.string().trim().url("Enter a valid link").or(z.literal("")),
    publish: z.boolean(),
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    path: ["endsAt"],
    message: "The end must be after the start",
  });

type FormValues = z.input<typeof schema>;

export default function CreateEventPage() {
  const { can } = usePermissions();
  const router = useRouter();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      // Approximate Mosoriot area. Adjust, or press "Use my location".
      lat: 0.2,
      lng: 35.05,
      startsAt: "",
      endsAt: "",
      category: "CLEANUP",
      capacity: 50,
      coverImageUrl: "",
      publish: true,
    },
  });

  if (!can("events:create")) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-[var(--fg-subtle)]" aria-hidden />
        <h1 className="mt-3 text-xl font-semibold">Not allowed</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">Only administrators can create events.</p>
        <Link href="/events" className="mt-4 inline-block text-sm font-medium underline">
          Back to events
        </Link>
      </div>
    );
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Location is not available on this device.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("lat", Number(pos.coords.latitude.toFixed(6)));
        setValue("lng", Number(pos.coords.longitude.toFixed(6)));
        toast.success("Location filled in.");
      },
      () => toast.error("Could not read your location."),
    );
  };

  const onSubmit = async (raw: FormValues) => {
    const v = schema.parse(raw);
    setBusy(true);
    try {
      await api.post("/events", {
        title: v.title,
        description: v.description,
        location: v.location,
        lat: v.lat,
        lng: v.lng,
        startsAt: new Date(v.startsAt).toISOString(),
        endsAt: new Date(v.endsAt).toISOString(),
        category: v.category,
        capacity: v.capacity,
        publish: v.publish,
        ...(v.coverImageUrl ? { coverImageUrl: v.coverImageUrl } : {}),
      });
      toast.success(v.publish ? "Event published." : "Event saved as a draft.");
      await qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "events" });
      router.push("/events");
    } catch (err) {
      console.error("Create event error:", err);
      toast.error(err instanceof ApiError ? err.message : "Could not create the event.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl py-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to events
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Create an event</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--fg-muted)]">
        Published events appear on the public Events page and the home page.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Title" error={errors.title?.message} {...register("title")} />

        <label className="block text-sm font-medium">
          Description
          <textarea
            rows={5}
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2.5 text-base"
            {...register("description")}
          />
          {errors.description && (
            <span className="mt-1 block text-xs text-red-600">{errors.description.message}</span>
          )}
        </label>

        <label className="block text-sm font-medium">
          Category
          <select className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2.5 text-base" {...register("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Starts" type="datetime-local" error={errors.startsAt?.message} {...register("startsAt")} />
          <Input label="Ends" type="datetime-local" error={errors.endsAt?.message} {...register("endsAt")} />
        </div>

        <Input label="Venue / location" error={errors.location?.message} {...register("location")} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Latitude" type="number" step="any" error={errors.lat?.message} {...register("lat")} />
          <Input label="Longitude" type="number" step="any" error={errors.lng?.message} {...register("lng")} />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
          <LocateFixed className="h-4 w-4" aria-hidden /> Use my location
        </Button>

        <Input label="Capacity" type="number" error={errors.capacity?.message} {...register("capacity")} />
        <Input
          label="Cover image link (optional)"
          inputMode="url"
          error={errors.coverImageUrl?.message}
          {...register("coverImageUrl")}
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("publish")} />
          Publish now (untick to save as a draft)
        </label>

        <Button type="submit" size="lg" fullWidth loading={busy}>
          <CalendarPlus className="h-4 w-4" aria-hidden /> Create event
        </Button>
      </form>
    </div>
  );
}
