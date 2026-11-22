import { SetMetadata } from "@nestjs/common";
import type { Permission } from "../permissions";

export const PERMISSIONS_KEY = "permissions";
export const ANY_PERMISSIONS_KEY = "permissions_any";

/** The user must hold ALL of these permissions. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/** The user must hold AT LEAST ONE of these permissions. */
export const RequireAnyPermission = (...permissions: Permission[]) =>
  SetMetadata(ANY_PERMISSIONS_KEY, permissions);
