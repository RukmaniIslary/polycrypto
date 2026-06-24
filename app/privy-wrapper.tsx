"use client";

import { PrivyProvider } from "@privy-io/react-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

// Validate that the App ID looks like a real Privy ID (starts with "cl" or similar cuid)
// If not set, render children without Privy so the UI still loads
function isValidPrivyAppId(id: string): boolean {
  return id.length > 10 && id !== "your_privy_app_id" && id !== "placeholder-app-id";
}

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!isValidPrivyAppId(PRIVY_APP_ID)) {
    // No valid Privy ID — render app in demo mode without auth
    // Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local to enable auth
    return <>{children}</>;
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
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
