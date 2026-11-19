import { api } from "./client";
import type { Member, MembershipApplication } from "@/types/members";

export const membersApi = {
  list: (params?: { q?: string; skill?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.skill) qs.set("skill", params.skill);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get<{ items: Member[] }>(`/members${suffix}`);
  },
  detail: (id: string) => api.get<{ member: Member }>(`/members/${id}`),

  applications: () =>
    api.get<{ items: MembershipApplication[] }>("/members/applications"),
  approve: (id: string) =>
    api.post<{ application: MembershipApplication }>(`/members/applications/${id}/approve`),
  reject: (id: string, note: string) =>
    api.post<{ application: MembershipApplication }>(`/members/applications/${id}/reject`, { note }),
};
