// apps/web/src/components/admin/ProjectForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { projectsApi, type Project } from "@/lib/api/projects.api";

const schema = z.object({
  title: z.string().trim().min(3, "Enter a title").max(120),
  summary: z.string().trim().min(10, "Write at least a short sentence").max(220, "Keep it under 220 characters"),
  description: z.string().trim().min(20, "Describe the project").max(8000),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  phase: z.enum(["PLANNED", "ONGOING", "COMPLETED"]),
  location: z.string().trim().max(120).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  coverImageUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https:\/\//.test(v), "Must start with https://")
    .optional(),
  highlights: z.string().optional(), // one per line
});
type FormValues = z.infer<typeof schema>;

const fieldClass =
  "mt-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2.5 text-base";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title ?? "",
      summary: project?.summary ?? "",
      description: project?.description ?? "",
      status: project?.status ?? "DRAFT",
      phase: project?.phase ?? "ONGOING",
      location: project?.location ?? "",
      startDate: project?.startDate?.slice(0, 10) ?? "",
      endDate: project?.endDate?.slice(0, 10) ?? "",
      coverImageUrl: project?.coverImageUrl ?? "",
      highlights: project?.highlights.join("\n") ?? "",
    },
  });

  const onSubmit = async (v: FormValues) => {
    setBusy(true);
    try {
      const payload = {
        title: v.title,
        summary: v.summary,
        description: v.description,
        status: v.status,
        phase: v.phase,
        ...(v.location ? { location: v.location } : {}),
        ...(v.startDate ? { startDate: v.startDate } : {}),
        ...(v.endDate ? { endDate: v.endDate } : {}),
        ...(v.coverImageUrl ? { coverImageUrl: v.coverImageUrl } : {}),
        highlights: (v.highlights ?? "")
          .split("\n")
          .map((h) => h.trim())
          .filter(Boolean),
      };
      if (project) await projectsApi.update(project.id, payload);
      else await projectsApi.create(payload);
      await queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success(
        v.status === "PUBLISHED"
          ? "Saved. It will show on the website within about a minute."
          : "Saved.",
      );
      router.push("/admin/projects");
    } catch (err) {
      console.error("Save project error:", err);
      toast.error(err instanceof ApiError ? err.message : "Could not save the project.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input label="Title" error={errors.title?.message} {...register("title")} />

      <label className="block text-sm font-medium">
        Short summary (shown on cards)
        <textarea rows={2} className={fieldClass} {...register("summary")} />
        {errors.summary && <span className="text-xs text-red-600">{errors.summary.message}</span>}
      </label>

      <label className="block text-sm font-medium">
        Full description (leave a blank line between paragraphs)
        <textarea rows={8} className={fieldClass} {...register("description")} />
        {errors.description && <span className="text-xs text-red-600">{errors.description.message}</span>}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Progress
          <select className={fieldClass} {...register("phase")}>
            <option value="PLANNED">Planned</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Visibility on the website
          <select className={fieldClass} {...register("status")}>
            <option value="DRAFT">Draft (hidden)</option>
            <option value="PUBLISHED">Published (visible)</option>
            <option value="ARCHIVED">Archived (hidden)</option>
          </select>
        </label>
      </div>

      <Input label="Location (optional)" error={errors.location?.message} {...register("location")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Start date (optional)" type="date" {...register("startDate")} />
        <Input label="End date (optional)" type="date" {...register("endDate")} />
      </div>

      <Input
        label="Cover image link (optional, https://…)"
        inputMode="url"
        error={errors.coverImageUrl?.message}
        {...register("coverImageUrl")}
      />

      <label className="block text-sm font-medium">
        Highlights (optional, one per line)
        <textarea rows={4} className={fieldClass} {...register("highlights")} />
      </label>

      <div className="flex flex-col gap-3 xs:flex-row">
        <Button type="submit" size="lg" loading={busy}>
          {project ? "Save changes" : "Create project"}
        </Button>
        <Button type="button" size="lg" variant="secondary" onClick={() => router.push("/admin/projects")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
