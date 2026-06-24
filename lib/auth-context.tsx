"use client";
/**
 * auth-context — thin re-export shim so any legacy imports still work.
 * Real auth is now handled by Privy via privy-safe.ts + PrivyProvider in client-layout.tsx
 */
export type { AuthUser } from "@/lib/privy-safe";
export { usePrivySafe as useAuth } from "@/lib/privy-safe";

// No-op provider — PrivyProvider in client-layout.tsx is the real provider now.
import type { ReactNode } from "react";
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
