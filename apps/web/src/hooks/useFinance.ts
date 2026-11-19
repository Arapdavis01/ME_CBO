"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { financeApi, type StartDonationPayload } from "@/lib/api/finance.api";
import { ApiError } from "@/lib/api/client";
import type { PaymentMethod } from "@/types/finance";

export function useFinanceSummary() {
  return useQuery({
    queryKey: ["finance", "summary"],
    queryFn: async () => (await financeApi.summary()).summary,
    staleTime: 60_000,
  });
}

export function useMyDonations() {
  return useQuery({
    queryKey: ["finance", "donations", "mine"],
    queryFn: async () => (await financeApi.myDonations()).items,
  });
}

export function useAllDonations(status?: "PENDING" | "SUCCEEDED" | "FAILED") {
  return useQuery({
    queryKey: ["finance", "donations", "all", status],
    queryFn: async () => (await financeApi.allDonations({ status })).items,
  });
}

export function useMyInvoices() {
  return useQuery({
    queryKey: ["finance", "dues", "mine"],
    queryFn: async () => (await financeApi.myInvoices()).items,
  });
}

export function useAllInvoices(status?: "PAID" | "DUE" | "OVERDUE") {
  return useQuery({
    queryKey: ["finance", "dues", "all", status],
    queryFn: async () => (await financeApi.allInvoices({ status })).items,
  });
}

export function useExpenses(status?: "PENDING" | "APPROVED" | "REJECTED" | "PAID") {
  return useQuery({
    queryKey: ["finance", "expenses", status],
    queryFn: async () => (await financeApi.expenses({ status })).items,
  });
}

export function useStartDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartDonationPayload) => financeApi.startDonation(payload),
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not start donation.";
      toast.error(msg);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["finance", "donations"] });
    },
  });
}

export function usePayInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: PaymentMethod }) =>
      financeApi.payInvoice(id, method),
    onSuccess: () => {
      toast.success("Payment initiated. Check your phone.");
      void qc.invalidateQueries({ queryKey: ["finance", "dues"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Payment failed.";
      toast.error(msg);
    },
  });
}

export function useApproveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.approveExpense(id),
    onSuccess: () => {
      toast.success("Expense approved.");
      void qc.invalidateQueries({ queryKey: ["finance", "expenses"] });
      void qc.invalidateQueries({ queryKey: ["finance", "summary"] });
    },
  });
}

export function useRejectExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      financeApi.rejectExpense(id, reason),
    onSuccess: () => {
      toast.success("Expense rejected.");
      void qc.invalidateQueries({ queryKey: ["finance", "expenses"] });
    },
  });
}
