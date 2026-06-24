"use client";

/**
 * Safe wrapper around usePrivy that returns minimal defaults when Privy is not
 * initialized (e.g. during development without a valid App ID).
 */
import { usePrivy as _usePrivy } from "@privy-io/react-auth";

// Minimal shape we actually use throughout the app
export interface SafePrivy {
  ready: boolean;
  authenticated: boolean;
  user: { id: string; wallet?: { address: string } } | null;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const DEMO_PRIVY: SafePrivy = {
  ready: true,
  authenticated: false,
  user: null,
  login: () => {
    alert(
      "Add your Privy App ID to .env.local to enable auth.\n" +
      "Get it free at https://dashboard.privy.io"
    );
  },
  logout: async () => {},
  getAccessToken: async () => null,
};

export function usePrivySafe(): SafePrivy {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const privy = _usePrivy();
    return {
      ready: privy.ready,
      authenticated: privy.authenticated,
      user: privy.user as SafePrivy["user"],
      login: privy.login,
      logout: privy.logout,
      getAccessToken: privy.getAccessToken,
    };
  } catch {
    return DEMO_PRIVY;
  }
}
