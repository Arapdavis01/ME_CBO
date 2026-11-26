// apps/web/src/lib/api/inventory.api.ts
import { api } from "./client";

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  location: string | null;
  quantityTotal: number;
  quantityAvailable: number;
};

export type LoanStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "RETURNED";

export type InventoryLoan = {
  id: string;
  itemId: string;
  itemName: string;
  userId: string;
  requesterName: string;
  quantity: number;
  status: LoanStatus;
  purpose: string | null;
  neededBy: string | null;
  createdAt: string;
  decidedAt: string | null;
  returnedAt: string | null;
};

export type ItemInput = {
  name: string;
  category?: string;
  description?: string;
  location?: string;
  quantityTotal: number;
};

export const inventoryApi = {
  items: () => api.get<{ items: InventoryItem[] }>("/inventory/items"),
  createItem: (input: ItemInput) =>
    api.post<{ item: InventoryItem }>("/inventory/items", input),
  updateItem: (id: string, input: Partial<ItemInput>) =>
    api.patch<{ item: InventoryItem }>(`/inventory/items/${id}`, input),
  removeItem: (id: string) => api.delete<{ ok: true }>(`/inventory/items/${id}`),

  request: (id: string, input: { quantity: number; purpose?: string; neededBy?: string }) =>
    api.post<{ loan: unknown }>(`/inventory/items/${id}/request`, input),
  myLoans: () => api.get<{ items: InventoryLoan[] }>("/inventory/loans/mine"),
  openLoans: () => api.get<{ items: InventoryLoan[] }>("/inventory/loans"),
  decide: (id: string, decision: "APPROVED" | "REJECTED") =>
    api.patch<{ loan: unknown }>(`/inventory/loans/${id}/decision`, { decision }),
  markReturned: (id: string) =>
    api.post<{ loan: unknown }>(`/inventory/loans/${id}/return`),
};
