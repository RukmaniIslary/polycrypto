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
        loginMethods: ["telegram", "wallet", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#3B82F6",
          logo: "/logo.svg",
          landingHeader: "Sign in to PolyCrypto",
          loginMessage: "Predict the Market. Own the Outcome.",
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
  );
}
