"use client";
import { useAuth } from "@/lib/auth-context";
export type { AuthUser } from "@/lib/auth-context";

export interface SafePrivy {
  user: import("@/lib/auth-context").AuthUser | null;
  authenticated: boolean;
  ready: boolean;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  privyAvailable: boolean;
}

export function usePrivySafe(): SafePrivy {
  const auth = useAuth();
  return {
    user: auth.user,
    authenticated: auth.authenticated,
    ready: auth.ready,
    login: auth.login,
    logout: async () => auth.logout(),
    getAccessToken: async () => auth.getToken(),
    privyAvailable: auth.authenticated,
  };
}
