import { api } from "./client";
import type { SwapListing } from "@/types/swap";

export type CreateSwapPayload = {
  title: string;
  description: string;
  category: SwapListing["category"];
  condition: SwapListing["condition"];
  location: string;
  photoDataUrl?: string;
};

export const swapApi = {
  list: () => api.get<{ items: SwapListing[] }>("/swap"),
  detail: (id: string) => api.get<{ listing: SwapListing }>(`/swap/${id}`),
  create: (payload: CreateSwapPayload) =>
    api.post<{ listing: SwapListing }>("/swap", payload),
  claim: (id: string) => api.post<{ listing: SwapListing }>(`/swap/${id}/claim`),
};
