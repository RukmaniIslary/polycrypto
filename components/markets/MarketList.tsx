"use client";

import type { Market } from "@/types";
import { MarketCard } from "./MarketCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface MarketListProps {
  markets: Market[];
}

export function MarketList({ markets }: MarketListProps) {
  if (markets.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No markets found"
        description="Try adjusting your search or filter."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-4">
      {markets.map((market, i) => (
        <MarketCard key={market.id} market={market} index={i} />
      ))}
    </div>
  );
}
