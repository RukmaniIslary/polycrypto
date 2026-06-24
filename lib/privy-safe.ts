"use client";

import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  walletAddress?: string;
}

export interface SafePrivy {
  ready: boolean;
  authenticated: boolean;
  user: AuthUser | null;
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
