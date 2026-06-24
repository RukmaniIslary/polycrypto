"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { ToastContainer } from "@/components/ui/Toast";
import { SafePrivyContext, PrivyAvailableContext, DEMO_PRIVY } from "@/lib/privy-safe";
import dynamic from "next/dynamic";

// Privy provider loaded client-only — no SSR
const PrivyProviderWrapper = dynamic(
  () => import("./privy-wrapper").then((m) => m.PrivyProviderWrapper),
  { ssr: false }
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Outer safe defaults — always present, ensures usePrivySafe() never fails
    <SafePrivyContext.Provider value={DEMO_PRIVY}>
      <PrivyAvailableContext.Provider value={false}>
        <QueryClientProvider client={queryClient}>
          {/* PrivyProviderWrapper will override the context once loaded */}
          <PrivyProviderWrapper>
            {children}
          </PrivyProviderWrapper>
          <ToastContainer />
        </QueryClientProvider>
      </PrivyAvailableContext.Provider>
    </SafePrivyContext.Provider>
  );
}
