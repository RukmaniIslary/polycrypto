"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi-config";
import { ToastContainer } from "@/components/ui/Toast";
import { useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));

  return (
    <WagmiProvider config={wagmiConfig}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          loginMethods: ["email"],
          appearance: {
            theme: "dark",
            accentColor: "#3B82F6",
            logo: "/logo.svg",
            landingHeader: "Sign in to PolyCrypto",
            loginMessage: "Predict the Market. Own the Outcome.",
            showWalletLoginFirst: false,
            walletList: [
              "detected_wallets",
              "metamask",
              "coinbase_wallet",
              "rainbow",
              "wallet_connect",
            ],
          },
          embeddedWallets: {
            ethereum: { createOnLogin: "users-without-wallets" },
          },
        }}
      >
        <QueryClientProvider client={qc}>
          {children}
          <ToastContainer />
        </QueryClientProvider>
      </PrivyProvider>
    </WagmiProvider>
  );
}
