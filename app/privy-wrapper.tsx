"use client";

import { type ReactNode } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { DEMO_PRIVY, SafePrivyContext, PrivyAvailableContext, type SafePrivy } from "@/lib/privy-safe";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

function isValidPrivyAppId(id: string): boolean {
  return id.length > 10 && id !== "your_privy_app_id" && id !== "placeholder-app-id";
}

// Module-level component — React can reliably track hooks here
function PrivyBridge({ children }: { children: ReactNode }) {
  const privy = usePrivy();
  const value: SafePrivy = {
    ready: privy.ready,
    authenticated: privy.authenticated,
    user: privy.user as SafePrivy["user"],
    login: privy.login,
    logout: privy.logout,
    getAccessToken: privy.getAccessToken,
    privyAvailable: true,
  };
  return (
    <SafePrivyContext.Provider value={value}>
      <PrivyAvailableContext.Provider value={true}>
        {children}
      </PrivyAvailableContext.Provider>
    </SafePrivyContext.Provider>
  );
}

export function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  if (!isValidPrivyAppId(PRIVY_APP_ID)) {
    return (
      <SafePrivyContext.Provider value={DEMO_PRIVY}>
        <PrivyAvailableContext.Provider value={false}>
          {children}
        </PrivyAvailableContext.Provider>
      </SafePrivyContext.Provider>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["telegram", "wallet", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#3B82F6",
          logo: "/logo.svg",
          landingHeader: "PolyCrypto",
          loginMessage: "Predict the Market. Own the Outcome.",
        },
        embeddedWallets: { createOnLogin: "users-without-wallets" },
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
    </PrivyProvider>
  );
}
