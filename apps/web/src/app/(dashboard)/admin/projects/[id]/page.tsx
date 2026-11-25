// apps/web/src/app/(dashboard)/admin/projects/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { projectsApi } from "@/lib/api/projects.api";

function EditProject() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "projects", id],
    queryFn: () => projectsApi.get(id),
  });

  return (
    <div className="mx-auto max-w-2xl py-6">
      <Link href="/admin/projects" className="text-sm underline">← Back to projects</Link>
      <h1 className="mb-6 mt-3 text-2xl font-bold">Edit project</h1>
      {isLoading && <p className="text-sm">Loading…</p>}
      {isError && <p className="text-sm text-red-600">Could not load this project.</p>}
      {data && <ProjectForm project={data.project} />}
    </div>
  );
}

export default function EditProjectPage() {
  return (
    <AuthGuard permission="projects:manage">
      <EditProject />
    </AuthGuard>
  );
}
