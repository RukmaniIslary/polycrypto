// v2.0 — No Privy, custom auth
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { ToastContainer } from "@/components/ui/Toast";
import { PrivyProviderWrapper } from "./privy-wrapper";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProviderWrapper>
        {children}
        <ToastContainer />
      </PrivyProviderWrapper>
    </QueryClientProvider>
  );
}
