import { api } from "./client";
import type { AdminUser, AuditLogEntry, SystemSettings } from "@/types/admin";
import type { Role } from "@/lib/auth/permissions";

export const adminApi = {
  users: () => api.get<{ items: AdminUser[] }>("/admin/users"),
  setRole: (id: string, role: Role) =>
    api.patch<{ user: AdminUser }>(`/admin/users/${id}/role`, { role }),
  suspend: (id: string) => api.post<{ user: AdminUser }>(`/admin/users/${id}/suspend`),
  reactivate: (id: string) => api.post<{ user: AdminUser }>(`/admin/users/${id}/reactivate`),

  auditLogs: (params?: { page?: number; pageSize?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    const q = qs.toString() ? `?${qs.toString()}` : "";
    return api.get<{ items: AuditLogEntry[]; total: number }>(`/admin/audit-logs${q}`);
  },

  settings: () => api.get<{ settings: SystemSettings }>("/admin/settings"),
  updateSettings: (patch: Partial<SystemSettings>) =>
    api.patch<{ settings: SystemSettings }>("/admin/settings", patch),
};
