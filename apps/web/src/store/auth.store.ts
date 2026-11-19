"use client";

import { create } from "zustand";
import type { Role } from "@/lib/auth/permissions";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  mfaEnabled: boolean;
  avatarUrl?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  setUser: (u: AuthUser | null) => void;
  setStatus: (s: AuthState["status"]) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),
  setStatus: (status) => set({ status }),
  clear: () => set({ user: null, status: "unauthenticated" }),
}));
