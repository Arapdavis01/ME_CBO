import { api } from "./client";
import type { LearningResource } from "@/types/learning";

export const learningApi = {
  list: () => api.get<{ items: LearningResource[] }>("/learning"),
  detail: (slug: string) =>
    api.get<{ resource: LearningResource }>(`/learning/${slug}`),
};
