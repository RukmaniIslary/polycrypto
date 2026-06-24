"use client";

export const dynamic = "force-dynamic";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { CategoryTabs } from "@/components/markets/CategoryTabs";
import { MarketSearch } from "@/components/markets/MarketSearch";
import { MarketList } from "@/components/markets/MarketList";
import { MarketCard } from "@/components/markets/MarketCard";
import { MarketListSkeleton } from "@/components/ui/LoadingSkeleton";
import { useMarketSearch, useSortedMarkets } from "@/hooks/useMarkets";

export default function MarketsPage() {
  const { search, setSearch, category, setCategory, sort, setSort } = useMarketSearch();
  const { data: markets = [], isLoading } = useSortedMarkets(sort);

  const filtered = markets.filter((m) => {
    const matchCat = category === "All" || m.category === category;
    const matchSearch = m.question.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const trending = markets.slice(0, 4);

  return (
    <PageWrapper>
      <CategoryTabs active={category} onChange={setCategory} />
      <MarketSearch search={search} onSearch={setSearch} sort={sort} onSort={setSort} />

      {/* Trending strip */}
      {!search && category === "All" && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Trending</span>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-none">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="min-w-[220px] h-24 skeleton rounded-xl" />
                ))
              : trending.map((market, i) => (
                  <div key={market.id} className="min-w-[220px]">
                    <MarketCard market={market} index={i} />
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Full grid */}
      {isLoading ? (
        <MarketListSkeleton count={6} />
      ) : (
        <MarketList markets={filtered} />
      )}
    </PageWrapper>
  );
}
