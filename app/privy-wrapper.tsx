"use client";

import { useState, useEffect, type ReactNode } from "react";
import { DEMO_PRIVY, SafePrivyContext, PrivyAvailableContext } from "@/lib/privy-safe";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

function isValidPrivyAppId(id: string): boolean {
  return id.length > 10 && id !== "your_privy_app_id" && id !== "placeholder-app-id";
}

// Actual Privy tree — only rendered client-side after mount
function PrivyTree({ children }: { children: ReactNode }) {
  const { PrivyProvider, usePrivy } = require("@privy-io/react-auth");

  function Bridge({ kids }: { kids: ReactNode }) {
    const privy = usePrivy();
    const value = {
      ready: privy.ready,
      authenticated: privy.authenticated,
      user: privy.user,
      login: privy.login,
      logout: privy.logout,
      getAccessToken: privy.getAccessToken,
      privyAvailable: true,
    };
    return (
      <SafePrivyContext.Provider value={value}>
        <PrivyAvailableContext.Provider value={true}>
          {kids}
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
      <Bridge kids={children} />
    </PrivyProvider>
  );
}

export function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render children immediately with safe defaults
  // so the UI is never blocked waiting for Privy to mount
  if (!mounted || !isValidPrivyAppId(PRIVY_APP_ID)) {
    return (
      <SafePrivyContext.Provider value={DEMO_PRIVY}>
        <PrivyAvailableContext.Provider value={false}>
          {children}
        </PrivyAvailableContext.Provider>
      </SafePrivyContext.Provider>
    );
  }

  return <PrivyTree>{children}</PrivyTree>;
}
