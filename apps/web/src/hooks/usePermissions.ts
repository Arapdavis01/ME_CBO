"use client";

import { useAuth } from "./useAuth";
import {
  can,
  canAny,
  canAll,
  permissionsFor,
  type Permission,
} from "@/lib/auth/permissions";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role ?? null;

  return {
    role,
    permissions: permissionsFor(role),
    can: (p: Permission) => can(role, p),
    canAny: (ps: Permission[]) => canAny(role, ps),
    canAll: (ps: Permission[]) => canAll(role, ps),
  };
}
