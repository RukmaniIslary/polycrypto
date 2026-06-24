"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import { ToastContainer } from "@/components/ui/Toast";
import { useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  );
}
