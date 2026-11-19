import { api } from "./client";
import type { AuthUser } from "@/store/auth.store";

export type LoginPayload = { email: string; password: string };
export type LoginResult =
  | { mfaRequired: false; user: AuthUser }
  | { mfaRequired: true; challengeId: string };

export type MfaVerifyPayload = { challengeId: string; code: string };

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResult>("/auth/login", payload),

  verifyMfa: (payload: MfaVerifyPayload) =>
    api.post<{ user: AuthUser }>("/auth/mfa/verify", payload),

  me: () => api.get<{ user: AuthUser }>("/auth/me"),

  logout: () => api.post<{ ok: true }>("/auth/logout"),

  resendMfa: (challengeId: string) =>
    api.post<{ ok: true }>("/auth/mfa/resend", { challengeId }),
};
