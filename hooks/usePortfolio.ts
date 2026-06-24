"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { supabase } from "@/lib/supabase";
import type { Position, Order } from "@/types";

async function fetchPositions(userId: string): Promise<Position[]> {
  const { data, error } = await supabase
    .from("positions")
    .select("*, market:markets(*)")
    .eq("user_id", userId)
    .gt("shares", 0);
  if (error) throw error;
  return data ?? [];
}

async function fetchOrderHistory(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export function usePortfolio() {
  const { user, authenticated } = usePrivy();

  const positions = useQuery({
    queryKey: ["portfolio", user?.id],
    queryFn: () => fetchPositions(user!.id),
    enabled: authenticated && !!user?.id,
    staleTime: 30_000,
  });

  const history = useQuery({
    queryKey: ["order-history", user?.id],
    queryFn: () => fetchOrderHistory(user!.id),
    enabled: authenticated && !!user?.id,
    staleTime: 30_000,
  });

  const activePositions = positions.data ?? [];

  const totalInvested = activePositions.reduce(
    (acc, p) => acc + p.shares * p.avg_price,
    0
  );

  const totalCurrentValue = activePositions.reduce((acc, p) => {
    const currentPrice = p.side === "YES"
      ? p.market?.yes_probability ?? p.avg_price
      : 1 - (p.market?.yes_probability ?? 1 - p.avg_price);
    return acc + p.shares * currentPrice;
  }, 0);

  const totalPnL = totalCurrentValue - totalInvested;
  const roi = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return {
    positions,
    history,
    stats: { totalInvested, totalCurrentValue, totalPnL, roi },
  };
}
