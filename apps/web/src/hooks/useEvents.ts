"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "@/lib/api/events.api";
import type { EventItem } from "@/types/events";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => (await eventsApi.list()).items,
    staleTime: 30_000,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: async () => (await eventsApi.detail(id)).event,
    enabled: !!id,
  });
}

export function useRsvp(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: "join" | "cancel") =>
      action === "join" ? eventsApi.rsvp(eventId) : eventsApi.cancelRsvp(eventId),
    onMutate: async (action) => {
      await qc.cancelQueries({ queryKey: ["events", eventId] });
      const prev = qc.getQueryData<EventItem>(["events", eventId]);
      if (prev) {
        qc.setQueryData<EventItem>(["events", eventId], {
          ...prev,
          myRsvp: action === "join" ? "GOING" : "NONE",
          attending: Math.max(0, prev.attending + (action === "join" ? 1 : -1)),
        });
      }
      return { prev };
    },
    onError: (err, _a, ctx) => {
      if (ctx?.prev) qc.setQueryData(["events", eventId], ctx.prev);
      const msg = err instanceof ApiError ? err.message : "RSVP failed";
      toast.error(msg);
    },
    onSuccess: (_d, action) => {
      toast.success(action === "join" ? "You're in! See you there." : "RSVP cancelled.");
      void qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
