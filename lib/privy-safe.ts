"use client";

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
  login: () => {},
  logout: async () => {},
  getAccessToken: async () => null,
  privyAvailable: false,
};

export const SafePrivyContext = createContext<SafePrivy>(DEMO_PRIVY);
export const PrivyAvailableContext = createContext<boolean>(false);

export function usePrivySafe(): SafePrivy {
  return useContext(SafePrivyContext);
}
