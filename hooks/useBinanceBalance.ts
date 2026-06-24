"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";

async function fetchBinanceBalance(token: string): Promise<number> {
  const res = await fetch("/api/binance/balance", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.balance ?? 0;
}

export function useBinanceBalance() {
  const { authenticated, getAccessToken } = usePrivy();

  return useQuery({
    queryKey: ["binance-balance"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return 0;
      return fetchBinanceBalance(token);
    },
    enabled: authenticated,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}
