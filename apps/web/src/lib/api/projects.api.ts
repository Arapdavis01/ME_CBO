// apps/web/src/lib/api/projects.api.ts
import { api } from "./client";

export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ProjectPhase = "PLANNED" | "ONGOING" | "COMPLETED";

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  coverImageUrl: string | null;
  highlights: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  title: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  location?: string;
  startDate?: string;
  endDate?: string;
  coverImageUrl?: string;
  highlights?: string[];
};

export const projectsApi = {
  list: () => api.get<{ items: Project[] }>("/projects"),
  get: (id: string) => api.get<{ project: Project }>(`/projects/${id}`),
  create: (input: ProjectInput) => api.post<{ project: Project }>("/projects", input),
  update: (id: string, input: Partial<ProjectInput>) =>
    api.patch<{ project: Project }>(`/projects/${id}`, input),
  remove: (id: string) => api.delete<{ ok: true }>(`/projects/${id}`),
};
