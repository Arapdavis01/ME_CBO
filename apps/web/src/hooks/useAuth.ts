"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { ApiError } from "@/lib/api/client";

export function useAuth() {
  const { user, status, setUser, setStatus, clear } = useAuthStore();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const { user: u } = await authApi.me();
        setUser(u);
        return u;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clear();
          return null;
        }
        throw err;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (meQuery.isLoading) setStatus("loading");
    else if (meQuery.data) setUser(meQuery.data);
    else if (meQuery.isError) clear();
  }, [meQuery.isLoading, meQuery.data, meQuery.isError, setUser, setStatus, clear]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clear();
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.clear();
      window.location.href = "/login";
    }
  }, [clear, queryClient]);

  return {
    user,
    status,
    isAuthenticated: !!user,
    isLoading: status === "loading" || meQuery.isLoading,
    logout,
    refetch: meQuery.refetch,
  };
}
