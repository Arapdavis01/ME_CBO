import { api } from "./client";
import type { EventItem, ProofOfWorkPayload } from "@/types/events";

export const eventsApi = {
  list: () => api.get<{ items: EventItem[] }>("/events"),

  detail: (id: string) => api.get<{ event: EventItem }>(`/events/${id}`),

  rsvp: (id: string) => api.post<{ event: EventItem }>(`/events/${id}/rsvp`),

  cancelRsvp: (id: string) => api.post<{ event: EventItem }>(`/events/${id}/rsvp/cancel`),

  checkin: (id: string, token: string) =>
    api.post<{ ok: true; alreadyCheckedIn: boolean }>(`/events/${id}/checkin`, { token }),

  uploadProof: (payload: Omit<ProofOfWorkPayload, "clientId"> & { clientId: string }) =>
    api.post<{ ok: true; proofId: string }>("/events/proofs", payload),
};
