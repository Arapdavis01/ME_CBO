"use client";

import { useQuery } from "@tanstack/react-query";
import { impactApi } from "@/lib/api/impact.api";

export function useMyImpact() {
  return useQuery({
    queryKey: ["impact", "me"],
    queryFn: async () => (await impactApi.mine()).metrics,
    staleTime: 60_000,
  });
}

export function useClubImpact() {
  return useQuery({
    queryKey: ["impact", "club"],
    queryFn: async () => (await impactApi.club()).metrics,
    staleTime: 60_000,
  });
}

export function useImpactHistory(months = 6) {
  return useQuery({
    queryKey: ["impact", "history", months],
    queryFn: async () => (await impactApi.history(months)).items,
    staleTime: 60_000,
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ["impact", "badges"],
    queryFn: async () => (await impactApi.badges()).items,
    staleTime: 60_000,
  });
}

export function useCertificates() {
  return useQuery({
    queryKey: ["impact", "certificates"],
    queryFn: async () => (await impactApi.certificates()).items,
    staleTime: 60_000,
  });
}
