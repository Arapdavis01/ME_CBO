// apps/web/src/lib/api/swap.api.ts
import { api } from "./client";

export const SWAP_CATEGORIES = [
  "Tools",
  "Seedlings & plants",
  "Clothes",
  "Books",
  "Household",
  "Electronics",
  "Other",
] as const;
export type SwapCategory = (typeof SWAP_CATEGORIES)[number];

export type SwapListing = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  wanted: string | null;
  location: string | null;
  imageUrl: string | null;
  status: "OPEN" | "COMPLETED" | "CANCELLED";
  ownerName: string;
  mine: boolean;
  requestCount: number;
  requested: boolean;
  createdAt: string;
};

export type SwapRequestRow = {
  id: string;
  requesterName: string;
  phone: string | null;
  message: string | null;
  createdAt: string;
};

export type ListingInput = {
  title: string;
  category: SwapCategory;
  description?: string;
  wanted?: string;
  location?: string;
  imageUrl?: string;
};

export const swapApi = {
  list: (params: { q?: string; category?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.category) qs.set("category", params.category);
    const s = qs.toString();
    return api.get<{ items: SwapListing[] }>(`/swap${s ? `?${s}` : ""}`);
  },
  create: (input: ListingInput) => api.post<{ listing: SwapListing }>("/swap", input),
  setStatus: (id: string, status: "OPEN" | "COMPLETED" | "CANCELLED") =>
    api.patch<{ listing: SwapListing }>(`/swap/${id}`, { status }),
  remove: (id: string) => api.delete<{ ok: true }>(`/swap/${id}`),
  request: (id: string, message?: string) =>
    api.post<{ ok: true }>(`/swap/${id}/requests`, message ? { message } : {}),
  requests: (id: string) =>
    api.get<{ items: SwapRequestRow[] }>(`/swap/${id}/requests`),
};
