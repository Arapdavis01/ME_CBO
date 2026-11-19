import { api } from "./client";
import type { Incident, CreateIncidentPayload } from "@/types/incidents";

export const incidentsApi = {
  list: (params?: { status?: Incident["status"] }) => {
    const q = params?.status ? `?status=${params.status}` : "";
    return api.get<{ items: Incident[] }>(`/incidents${q}`);
  },
  detail: (id: string) => api.get<{ incident: Incident }>(`/incidents/${id}`),
  create: (payload: CreateIncidentPayload) =>
    api.post<{ incident: Incident }>("/incidents", payload),
  resolve: (id: string, note: string) =>
    api.post<{ incident: Incident }>(`/incidents/${id}/resolve`, { note }),
  dismiss: (id: string, note: string) =>
    api.post<{ incident: Incident }>(`/incidents/${id}/dismiss`, { note }),
};
