// apps/web/src/app/(dashboard)/admin/projects/new/page.tsx
"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <AuthGuard permission="projects:manage">
      <div className="mx-auto max-w-2xl py-6">
        <Link href="/admin/projects" className="text-sm underline">← Back to projects</Link>
        <h1 className="mb-6 mt-3 text-2xl font-bold">New project</h1>
        <ProjectForm />
      </div>
    </AuthGuard>
  );
}
