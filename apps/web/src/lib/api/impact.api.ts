import { api } from "./client";
import type {
  ImpactMetric,
  ClubMetric,
  Badge,
  Certificate,
  ImpactHistory,
} from "@/types/impact";

export const impactApi = {
  mine: () => api.get<{ metrics: ImpactMetric }>("/impact/me"),

  club: () => api.get<{ metrics: ClubMetric }>("/impact/club"),

  history: (months = 6) =>
    api.get<{ items: ImpactHistory[] }>(`/impact/history?months=${months}`),

  badges: () => api.get<{ items: Badge[] }>("/impact/badges"),

  certificates: () => api.get<{ items: Certificate[] }>("/impact/certificates"),

  certificate: (id: string) =>
    api.get<{ certificate: Certificate }>(`/impact/certificates/${id}`),

  issueCertificate: (type: Certificate["type"]) =>
    api.post<{ certificate: Certificate }>("/impact/certificates", { type }),
};
