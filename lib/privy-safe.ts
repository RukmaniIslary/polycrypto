"use client";

/**
 * Safe Privy hook — works whether or not PrivyProvider is mounted.
 * Reads from SafePrivyContext set by PrivyProviderWrapper/PrivyBridge.
 * Never calls usePrivy() directly — avoids React error #438 in production.
 */
import { createContext, useContext } from "react";

export interface SafePrivy {
  ready: boolean;
  authenticated: boolean;
  user: { id: string; wallet?: { address: string } } | null;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  privyAvailable: boolean;
}

export const DEMO_PRIVY: SafePrivy = {
  ready: true,
  authenticated: false,
  user: null,
  login: () => {
    if (typeof window !== "undefined") {
      alert(
        "Set NEXT_PUBLIC_PRIVY_APP_ID in your environment variables.\n" +
        "Get a free App ID at https://dashboard.privy.io"
      );
    }
  },
  logout: async () => {},
  getAccessToken: async () => null,
  privyAvailable: false,
};

// This context is populated by PrivyProviderWrapper in app/privy-wrapper.tsx
export const SafePrivyContext = createContext<SafePrivy>(DEMO_PRIVY);
export const PrivyAvailableContext = createContext<boolean>(false);

export function usePrivySafe(): SafePrivy {
  return useContext(SafePrivyContext);
}
