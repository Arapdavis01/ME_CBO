// apps/web/src/app/(dashboard)/admin/projects/page.tsx
"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { projectsApi, type Project } from "@/lib/api/projects.api";

const STATUS_LABEL = { DRAFT: "Draft", PUBLISHED: "Published", ARCHIVED: "Archived" } as const;
const PHASE_LABEL = { PLANNED: "Planned", ONGOING: "Ongoing", COMPLETED: "Completed" } as const;

function ProjectsAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: () => projectsApi.list(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
  const onError = (err: unknown) =>
    toast.error(err instanceof ApiError ? err.message : "Something went wrong.");

  const toggle = useMutation({
    mutationFn: (p: Project) =>
      projectsApi.update(p.id, { status: p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
    onSuccess: (_r, p) => {
      toast.success(p.status === "PUBLISHED" ? "Hidden from the website." : "Published. It shows within about a minute.");
      void refresh();
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (p: Project) => projectsApi.remove(p.id),
    onSuccess: () => {
      toast.success("Project deleted.");
      void refresh();
    },
    onError,
  });

  const items = data?.items ?? [];

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/admin/projects/new">
          <Button><Plus className="h-4 w-4" aria-hidden />New project</Button>
        </Link>
      </div>
      <p className="mt-1 text-sm opacity-80">
        Published projects appear on the public website. Events are managed in the Events section.
      </p>

      {isLoading && <p className="mt-8 text-sm">Loading…</p>}
      {isError && <p className="mt-8 text-sm text-red-600">Could not load projects.</p>}
      {!isLoading && !isError && items.length === 0 && (
        <p className="mt-8 rounded-xl border p-6 text-sm">No projects yet. Create the first one.</p>
      )}

      <ul className="mt-6 space-y-3">
        {items.map((p) => (
          <li key={p.id} className="rounded-xl border border-[var(--border)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs opacity-70">
                  {PHASE_LABEL[p.phase]} · {STATUS_LABEL[p.status]} · updated{" "}
                  {new Date(p.updatedAt).toLocaleDateString("en-KE")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.status === "PUBLISHED" && (
                  <Link href={`/projects/${p.slug}`} target="_blank">
                    <Button size="sm" variant="ghost">View</Button>
                  </Link>
                )}
                <Link href={`/admin/projects/${p.id}`}>
                  <Button size="sm" variant="secondary">Edit</Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  loading={toggle.isPending && toggle.variables?.id === p.id}
                  onClick={() => toggle.mutate(p)}
                >
                  {p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={remove.isPending && remove.variables?.id === p.id}
                  onClick={() => {
                    if (window.confirm(`Delete “${p.title}”? This cannot be undone.`)) remove.mutate(p);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminProjectsPage() {
  return (
    <AuthGuard permission="projects:manage">
      <ProjectsAdmin />
    </AuthGuard>
  );
}
