"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastContainer } from "@/components/ui/Toast";

// Lazy load PrivyProvider so it only runs client-side
import dynamic from "next/dynamic";

const PrivyProviderWrapper = dynamic(
  () => import("./privy-wrapper").then((m) => m.PrivyProviderWrapper),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProviderWrapper>
        {children}
        <ToastContainer />
      </PrivyProviderWrapper>
    </QueryClientProvider>
  );
}
