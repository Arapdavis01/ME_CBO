// apps/web/src/app/(dashboard)/admin/announcements/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/Button";
import { NoticeBar, formatWindow } from "@/components/announcements/NoticeBar";
import { ApiError } from "@/lib/api/client";
import { announcementsApi, type Announcement } from "@/lib/api/announcements.api";

const schema = z.object({
  message: z.string().trim().min(5, "Write the message").max(280, "Keep it under 280 characters"),
  kind: z.enum(["INFO", "MAINTENANCE", "WARNING"]),
  showFrom: z.string().optional(),
  windowStart: z.string().optional(),
  windowEnd: z.string().optional(),
  active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const fieldClass =
  "mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-base";

/** ISO -> value for <input type="datetime-local"> in the viewer's own time zone. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
const toIso = (v?: string) => (v ? new Date(v).toISOString() : undefined);

const EMPTY: FormValues = {
  message: "", kind: "INFO", showFrom: "", windowStart: "", windowEnd: "", active: true,
};

function tonightExample(): FormValues {
  const start = new Date();
  start.setHours(22, 0, 0, 0);
  const end = new Date(start);
  end.setHours(24, 0, 0, 0); // midnight
  return {
    message:
      "The system will be updated soon. It may be unavailable for a short while. Thank you for your patience.",
    kind: "MAINTENANCE",
    showFrom: toLocalInput(new Date().toISOString()),
    windowStart: toLocalInput(start.toISOString()),
    windowEnd: toLocalInput(end.toISOString()),
    active: true,
  };
}

function Notices() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Announcement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: () => announcementsApi.list(),
  });

  const {
    register, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
  const onError = (err: unknown) =>
    toast.error(err instanceof ApiError ? err.message : "Something went wrong.");

  const save = useMutation({
    mutationFn: (v: FormValues) => {
      const input = {
        message: v.message, kind: v.kind, active: v.active,
        showFrom: toIso(v.showFrom), windowStart: toIso(v.windowStart), windowEnd: toIso(v.windowEnd),
      };
      return editing ? announcementsApi.update(editing.id, input) : announcementsApi.create(input);
    },
    onSuccess: () => {
      toast.success("Saved. Visitors see it within about 15 seconds.");
      setEditing(null);
      reset(EMPTY);
      void refresh();
    },
    onError,
  });

  const toggle = useMutation({
    mutationFn: (a: Announcement) => announcementsApi.update(a.id, { active: !a.active }),
    onSuccess: () => void refresh(),
    onError,
  });

  const remove = useMutation({
    mutationFn: (a: Announcement) => announcementsApi.remove(a.id),
    onSuccess: () => { toast.success("Notice deleted."); void refresh(); },
    onError,
  });

  const startEdit = (a: Announcement) => {
    setEditing(a);
    reset({
      message: a.message, kind: a.kind, active: a.active,
      showFrom: toLocalInput(a.showFrom),
      windowStart: toLocalInput(a.windowStart),
      windowEnd: toLocalInput(a.windowEnd),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const w = watch();
  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-3xl py-6">
      <h1 className="text-2xl font-bold">Site notices</h1>
      <p className="mt-1 text-sm opacity-80">
        A notice appears as a banner on the website and inside the system. Use it to warn people
        before an update. It disappears by itself after the end time.
      </p>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide opacity-70">Preview</h2>
      <div className="mt-2 overflow-hidden rounded-lg border border-[var(--border)]">
        {w.message?.trim() ? (
          <NoticeBar
            kind={w.kind}
            message={w.message}
            windowStart={w.windowStart ? toIso(w.windowStart) ?? null : null}
            windowEnd={w.windowEnd ? toIso(w.windowEnd) ?? null : null}
          />
        ) : (
          <p className="p-4 text-sm opacity-60">Type a message to see how visitors will see it.</p>
        )}
      </div>

      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="mt-6 space-y-4" noValidate>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{editing ? "Edit notice" : "New notice"}</h2>
          {!editing && (
            <Button type="button" size="sm" variant="secondary" onClick={() => reset(tonightExample())}>
              Use “update tonight” example
            </Button>
          )}
        </div>

        <label className="block text-sm font-medium">
          Message
          <textarea rows={3} className={fieldClass} {...register("message")} />
          {errors.message && <span className="text-xs text-red-600">{errors.message.message}</span>}
        </label>

        <label className="block text-sm font-medium">
          Type
          <select className={fieldClass} {...register("kind")}>
            <option value="INFO">Information (green)</option>
            <option value="MAINTENANCE">Planned update (amber)</option>
            <option value="WARNING">Important warning (red)</option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Update starts (optional)
            <input type="datetime-local" className={fieldClass} {...register("windowStart")} />
          </label>
          <label className="block text-sm font-medium">
            Update ends (optional)
            <input type="datetime-local" className={fieldClass} {...register("windowEnd")} />
          </label>
        </div>
        <p className="-mt-2 text-xs opacity-70">
          Times are in your own time zone. For 10 PM to midnight, set the end to 12:00 AM of the next day.
          The notice hides itself after the end time.
        </p>

        <label className="block text-sm font-medium">
          Start showing the banner from (optional, default: now)
          <input type="datetime-local" className={fieldClass} {...register("showFrom")} />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" {...register("active")} />
          Show this notice to visitors
        </label>

        <div className="flex flex-col gap-3 xs:flex-row">
          <Button type="submit" size="lg" loading={save.isPending}>
            {editing ? "Save changes" : "Publish notice"}
          </Button>
          {editing && (
            <Button type="button" size="lg" variant="secondary" onClick={() => { setEditing(null); reset(EMPTY); }}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <h2 className="mb-3 mt-10 text-lg font-semibold">All notices</h2>
      {isLoading && <p className="text-sm">Loading…</p>}
      {!isLoading && items.length === 0 && <p className="text-sm opacity-70">No notices yet.</p>}
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-sm">{a.message}</p>
            <p className="mt-1 text-xs opacity-70">
              {a.kind === "INFO" ? "Information" : a.kind === "MAINTENANCE" ? "Planned update" : "Warning"}
              {" · "}{a.active ? "On" : "Off"}
              {formatWindow(a.windowStart, a.windowEnd) ? ` · ${formatWindow(a.windowStart, a.windowEnd)}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => startEdit(a)}>Edit</Button>
              <Button size="sm" variant="outline" loading={toggle.isPending && toggle.variables?.id === a.id} onClick={() => toggle.mutate(a)}>
                {a.active ? "Turn off" : "Turn on"}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => { if (window.confirm("Delete this notice?")) remove.mutate(a); }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  return (
    <AuthGuard permission="announcements:manage">
      <Notices />
    </AuthGuard>
  );
}
