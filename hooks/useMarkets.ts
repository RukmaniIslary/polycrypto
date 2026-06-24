"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MOCK_MARKETS } from "@/lib/mock-data";
import type { Market, MarketCategory } from "@/types";
import { useState } from "react";

async function fetchMarkets(): Promise<Market[]> {
  try {
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .order("volume_usdt", { ascending: false });
    // If Supabase not configured or returns error/empty, fall back to mock data
    if (error || !data || data.length === 0) return MOCK_MARKETS;
    return data;
  } catch {
    return MOCK_MARKETS;
  }
}

async function fetchMarket(id: string): Promise<Market> {
  // Check mock data first
  const mock = MOCK_MARKETS.find((m) => m.id === id);

  try {
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) {
      if (mock) return mock;
      throw new Error("Market not found");
    }
    return data;
  } catch {
    if (mock) return mock;
    throw new Error("Market not found");
  }
}

export function useMarkets(category: MarketCategory = "All", search = "") {
  const query = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const filtered = (query.data ?? []).filter((m) => {
    const matchCat = category === "All" || m.category === category;
    const matchSearch = m.question.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return { ...query, data: filtered };
}

export function useMarket(id: string) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => fetchMarket(id),
    staleTime: 10_000,
    refetchInterval: 15_000,
    enabled: !!id,
  });
}

export function useSortedMarkets(sort: "volume" | "newest" | "ending" | "hot" = "volume") {
  const { data: markets = [], ...rest } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const sorted = [...markets].sort((a, b) => {
    if (sort === "volume") return (b.volume_usdt ?? 0) - (a.volume_usdt ?? 0);
    if (sort === "newest")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "ending")
      return new Date(a.closes_at).getTime() - new Date(b.closes_at).getTime();
    if (sort === "hot") return (b.trader_count ?? 0) - (a.trader_count ?? 0);
    return 0;
  });

  return { ...rest, data: sorted };
}

export function useMarketSearch() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MarketCategory>("All");
  const [sort, setSort] = useState<"volume" | "newest" | "ending" | "hot">("volume");

  return { search, setSearch, category, setCategory, sort, setSort };
}
