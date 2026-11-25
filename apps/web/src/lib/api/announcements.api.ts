// apps/web/src/lib/api/announcements.api.ts
import { api } from "./client";

export type AnnouncementKind = "INFO" | "MAINTENANCE" | "WARNING";

export type Announcement = {
  id: string;
  kind: AnnouncementKind;
  message: string;
  showFrom: string;
  windowStart: string | null;
  windowEnd: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementInput = {
  message: string;
  kind: AnnouncementKind;
  showFrom?: string;
  windowStart?: string;
  windowEnd?: string;
  active: boolean;
};

export const announcementsApi = {
  list: () => api.get<{ items: Announcement[] }>("/announcements"),
  create: (input: AnnouncementInput) =>
    api.post<{ announcement: Announcement }>("/announcements", input),
  update: (id: string, input: Partial<AnnouncementInput>) =>
    api.patch<{ announcement: Announcement }>(`/announcements/${id}`, input),
  remove: (id: string) => api.delete<{ ok: true }>(`/announcements/${id}`),
};
