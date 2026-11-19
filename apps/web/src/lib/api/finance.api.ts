import { api } from "./client";
import type {
  Donation,
  DuesPlan,
  DuesInvoice,
  Expense,
  FinanceSummary,
  PaymentMethod,
} from "@/types/finance";

export type StartDonationPayload = {
  amountKes: number;
  method: PaymentMethod;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  message?: string;
  isAnonymous?: boolean;
};

export type StartDonationResult =
  | { status: "STK_SENT"; donation: Donation; checkoutRequestId: string }
  | { status: "REDIRECT"; donation: Donation; checkoutUrl: string };

export const financeApi = {
  /* Donations */
  startDonation: (payload: StartDonationPayload) =>
    api.post<StartDonationResult>("/finance/donations/start", payload),

  donationStatus: (id: string) =>
    api.get<{ donation: Donation }>(`/finance/donations/${id}`),

  myDonations: () =>
    api.get<{ items: Donation[] }>("/finance/donations/mine"),

  allDonations: (params?: { status?: Donation["status"] }) => {
    const q = params?.status ? `?status=${params.status}` : "";
    return api.get<{ items: Donation[] }>(`/finance/donations${q}`);
  },

  /* Dues */
  duesPlans: () => api.get<{ items: DuesPlan[] }>("/finance/dues/plans"),
  myInvoices: () => api.get<{ items: DuesInvoice[] }>("/finance/dues/mine"),
  allInvoices: (params?: { status?: DuesInvoice["status"] }) => {
    const q = params?.status ? `?status=${params.status}` : "";
    return api.get<{ items: DuesInvoice[] }>(`/finance/dues${q}`);
  },
  payInvoice: (id: string, method: PaymentMethod) =>
    api.post<{ invoice: DuesInvoice }>(`/finance/dues/${id}/pay`, { method }),

  /* Expenses */
  expenses: (params?: { status?: Expense["status"] }) => {
    const q = params?.status ? `?status=${params.status}` : "";
    return api.get<{ items: Expense[] }>(`/finance/expenses${q}`);
  },
  createExpense: (payload: {
    category: Expense["category"];
    description: string;
    amountKes: number;
    paidTo: string;
    receiptDataUrl?: string;
  }) => api.post<{ expense: Expense }>("/finance/expenses", payload),
  approveExpense: (id: string) =>
    api.post<{ expense: Expense }>(`/finance/expenses/${id}/approve`),
  rejectExpense: (id: string, reason: string) =>
    api.post<{ expense: Expense }>(`/finance/expenses/${id}/reject`, { reason }),

  /* Summary */
  summary: () => api.get<{ summary: FinanceSummary }>("/finance/summary"),
};
