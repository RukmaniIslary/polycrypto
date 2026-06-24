"use client";

import { useState, useEffect, type ReactNode } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { DEMO_PRIVY, SafePrivyContext, PrivyAvailableContext, type SafePrivy } from "@/lib/privy-safe";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

function isValid(id: string) {
  return id.length > 10 && id !== "your_privy_app_id" && id !== "placeholder-app-id";
}

// Reads real Privy values and calls onAuth to update parent state
function PrivyStateSync({ onAuth }: { onAuth: (v: SafePrivy) => void }) {
  const p = usePrivy();
  useEffect(() => {
    onAuth({
      ready: p.ready,
      authenticated: p.authenticated,
      user: p.user as SafePrivy["user"],
      login: p.login,
      logout: p.logout,
      getAccessToken: p.getAccessToken,
      privyAvailable: true,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.ready, p.authenticated, p.user]);
  return null;
}

export function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  const [authValue, setAuthValue] = useState<SafePrivy>(DEMO_PRIVY);
  const [clientMounted, setClientMounted] = useState(false);

  useEffect(() => { setClientMounted(true); }, []);

  return (
    <SafePrivyContext.Provider value={authValue}>
      <PrivyAvailableContext.Provider value={authValue.privyAvailable}>
        {/* Load real Privy only after hydration, only if App ID is valid */}
        {clientMounted && isValid(PRIVY_APP_ID) && (
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
            {/* Sync Privy state up to our context without re-rendering children */}
            <PrivyStateSync onAuth={setAuthValue} />
          </PrivyProvider>
        )}
        {children}
      </PrivyAvailableContext.Provider>
    </SafePrivyContext.Provider>
  );
}
