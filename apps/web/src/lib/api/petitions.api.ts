import { api } from "./client";
import type { Petition, CreatePetitionPayload } from "@/types/petitions";

export const petitionsApi = {
  list: () => api.get<{ items: Petition[] }>("/petitions"),
  detail: (slug: string) => api.get<{ petition: Petition }>(`/petitions/${slug}`),
  create: (payload: CreatePetitionPayload) =>
    api.post<{ petition: Petition }>("/petitions", payload),
  sign: (slug: string) => api.post<{ petition: Petition }>(`/petitions/${slug}/sign`),
};
