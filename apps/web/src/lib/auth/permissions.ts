/**
 * Frontend RBAC mirror of the NestJS backend permission matrix.
 * Defense-in-depth ONLY — the API enforces the same rules server-side.
 * Keep this file identical to apps/api/src/auth/permissions.ts.
 */
export type Role =
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN"
  | "FINANCE_ADMIN"
  | "TEAM_LEAD"
  | "MEMBER"
  | "PUBLIC";

export type Permission =
  | "events:read"
  | "events:create"
  | "events:update"
  | "events:delete"
  | "events:checkin"
  | "events:proof:verify"
  | "impact:read"
  | "impact:read:all"
  | "impact:log"
  | "impact:certificate:issue"
  | "members:read"
  | "members:directory"
  | "members:approve"
  | "members:create"
  | "members:manage"
  | "inventory:read"
  | "inventory:checkout"
  | "inventory:approve"
  | "inventory:manage"
  | "incidents:read"
  | "incidents:create"
  | "incidents:resolve"
  | "swap:read"
  | "swap:create"
  | "learning:read"
  | "learning:manage"
  | "finance:read"
  | "finance:manage"
  | "finance:approve"
  | "donations:read"
  | "admin:users:manage"
  | "admin:roles:manage"
  | "admin:audit:read"
  | "admin:settings:manage"
  | "petitions:manage"
  | "projects:manage"
  | "announcements:manage";

const ROLES: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "events:read",
    "events:create",
    "events:update",
    "events:delete",
    "events:checkin",
    "events:proof:verify",
    "impact:read",
    "impact:read:all",
    "impact:log",
    "impact:certificate:issue",
    "members:read",
    "members:directory",
    "members:approve",
    "members:create",
    "members:manage",
    "inventory:read",
    "inventory:checkout",
    "inventory:approve",
    "inventory:manage",
    "incidents:read",
    "incidents:create",
    "incidents:resolve",
    "swap:read",
    "swap:create",
    "learning:read",
    "learning:manage",
    "finance:read",
    "finance:manage",
    "finance:approve",
    "donations:read",
    "admin:users:manage",
    "admin:roles:manage",
    "admin:audit:read",
    "admin:settings:manage",
    "petitions:manage",
    "projects:manage",
    "announcements:manage",
  ],
  OPERATIONS_ADMIN: [
    "events:read",
    "events:create",
    "events:update",
    "events:delete",
    "events:checkin",
    "events:proof:verify",
    "impact:read",
    "impact:read:all",
    "impact:certificate:issue",
    "members:read",
    "members:directory",
    "members:approve",
    "members:create",
    "inventory:read",
    "inventory:checkout",
    "inventory:approve",
    "inventory:manage",
    "incidents:read",
    "incidents:create",
    "incidents:resolve",
    "swap:read",
    "learning:read",
    "learning:manage",
    "petitions:manage",
    "projects:manage",
    "announcements:manage",
  ],
  FINANCE_ADMIN: [
    "events:read",
    "impact:read",
    "impact:read:all",
    "members:read",
    "members:directory",
    "inventory:read",
    "inventory:approve",
    "finance:read",
    "finance:manage",
    "finance:approve",
    "donations:read",
  ],
  TEAM_LEAD: [
    "events:read",
    "events:update",
    "events:checkin",
    "events:proof:verify",
    "impact:read",
    "impact:log",
    "members:read",
    "inventory:read",
    "inventory:checkout",
    "incidents:read",
    "incidents:create",
    "swap:read",
    "learning:read",
  ],
  MEMBER: [
    "events:read",
    "events:checkin",
    "impact:read",
    "impact:log",
    "members:read",
    "inventory:read",
    "incidents:create",
    "swap:read",
    "swap:create",
    "learning:read",
  ],
  PUBLIC: [],
};

export function permissionsFor(role: Role | null | undefined): Permission[] {
  if (!role) return [];
  return ROLES[role] ?? [];
}

export function can(
  role: Role | null | undefined,
  permission: Permission,
): boolean {
  return permissionsFor(role).includes(permission);
}

export function canAny(
  role: Role | null | undefined,
  permissions: Permission[],
): boolean {
  const held = permissionsFor(role);
  return permissions.some((p) => held.includes(p));
}

export function canAll(
  role: Role | null | undefined,
  permissions: Permission[],
): boolean {
  const held = permissionsFor(role);
  return permissions.every((p) => held.includes(p));
}

export const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: "Chairperson / CEO",
  OPERATIONS_ADMIN: "Secretary",
  FINANCE_ADMIN: "Treasurer",
  TEAM_LEAD: "Field Officer",
  MEMBER: "Member / Volunteer",
  PUBLIC: "Guest",
};
