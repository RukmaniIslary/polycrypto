"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import type { PlaceOrderPayload, PlaceOrderResult } from "@/types";

async function placeOrder(
  payload: PlaceOrderPayload,
  authToken: string
): Promise<PlaceOrderResult> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to place order");
  }

  return res.json();
}

export function useTrading() {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: PlaceOrderPayload) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return placeOrder(payload, token);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["market", variables.market_id] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    placeOrder: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
