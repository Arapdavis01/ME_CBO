"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { incidentsApi } from "@/lib/api/incidents.api";
import { enqueueIncident } from "@/lib/offline/incident-queue";
import type { CreateIncidentPayload, Incident } from "@/types/incidents";
import { ApiError } from "@/lib/api/client";

export function useIncidents(status?: Incident["status"]) {
  return useQuery({
    queryKey: ["incidents", status],
    queryFn: async () => (await incidentsApi.list({ status })).items,
    staleTime: 30_000,
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateIncidentPayload) => {
      if (!navigator.onLine) {
        await enqueueIncident(payload);
        return { queued: true as const };
      }
      try {
        await incidentsApi.create(payload);
        return { queued: false as const };
      } catch {
        await enqueueIncident(payload);
        return { queued: true as const };
      }
    },
    onSuccess: (res) => {
      toast.success(
        res.queued
          ? "Saved offline. Will submit when you reconnect."
          : "Incident reported. Thank you for protecting Mosoriot.",
      );
      void qc.invalidateQueries({ queryKey: ["incidents"] });
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Could not report incident.";
      toast.error(msg);
    },
  });
}

export function useResolveIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      incidentsApi.resolve(id, note),
    onSuccess: () => {
      toast.success("Incident marked resolved.");
      void qc.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}
