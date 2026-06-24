"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { ToastContainer } from "@/components/ui/Toast";
import { useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        // loginMethods filters down from what's enabled in the Privy dashboard.
        // All three MUST also be enabled in the dashboard under Login methods.
        loginMethods: ["email", "wallet", "telegram"],
        appearance: {
          theme: "dark",
          accentColor: "#3B82F6",
          logo: "/logo.svg",
          landingHeader: "Sign in to PolyCrypto",
          loginMessage: "Predict the Market. Own the Outcome.",
          // Show wallet login prominently
          showWalletLoginFirst: false,
          // Supported wallet connectors shown in the modal
          walletList: [
            "detected_wallets",
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "wallet_connect",
          ],
        },
        embeddedWallets: {
          // Auto-create an embedded wallet for users who sign in without an external wallet
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      <QueryClientProvider client={qc}>
        {children}
        <ToastContainer />
      </QueryClientProvider>
    </PrivyProvider>
  );
}
