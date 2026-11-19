import type { Role } from "@/lib/auth/permissions";

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "SUSPENDED";
  mfaEnabled: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

export type SystemSettings = {
  organizationName: string;
  motto: string;
  contactEmail: string;
  contactPhone: string;
  allowPublicPetitions: boolean;
  requireMfaForAdmins: boolean;
};
