"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, Zap } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { CategoryTabs } from "@/components/markets/CategoryTabs";
import { MarketSearch } from "@/components/markets/MarketSearch";
import { MarketList } from "@/components/markets/MarketList";
import { MarketCard } from "@/components/markets/MarketCard";
import { MatchupCard } from "@/components/markets/MatchupCard";
import { MarketListSkeleton } from "@/components/ui/LoadingSkeleton";
import { useMarketSearch, useSortedMarkets } from "@/hooks/useMarkets";
import { FIFA_MATCHUPS, FAKE_LEADERBOARD } from "@/lib/mock-data";
import { formatUSDT } from "@/lib/utils";
import { usePrivySafe } from "@/lib/privy-safe";

export default function MarketsPage() {
  const { search, setSearch, category, setCategory, sort, setSort } = useMarketSearch();
  const { data: markets = [], isLoading } = useSortedMarkets(sort);
  const { authenticated, login } = usePrivySafe();

  const filtered = markets.filter((m) => {
    const matchCat = category === "All" || m.category === category;
    const matchSearch = m.question.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const isHome = !search && category === "All";
  const cryptoMarkets = markets.filter((m) => m.category === "Crypto").slice(0, 4);
  const topTraders = FAKE_LEADERBOARD.slice(0, 4);

  return (
    <PageWrapper>
      {/* ── Sign-in banner (only if not authenticated) ── */}
      {!authenticated && (
        <button
          onClick={login}
          className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center justify-between px-4 py-2.5 rounded-xl tap-scale"
          style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
        >
          <span className="text-sm" style={{ color: "#94A3B8" }}>
            Sign in to track your trades
          </span>
          <ChevronRight className="w-4 h-4" style={{ color: "#475569" }} />
        </button>
      )}

      {/* ── Home layout ── */}
      {isHome ? (
        <div className="flex flex-col">
          {/* ── Weekly Top Traders ── */}
          <section className="px-4 mt-4">
            <Link href="/leaderboard" className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: "#F59E0B" }} />
              <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                Weekly Top Traders
              </span>
              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: "#475569" }} />
            </Link>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {topTraders.map((trader) => (
                <Link key={trader.user_id} href="/leaderboard">
                  <div
                    className="shrink-0 w-36 rounded-2xl p-3 tap-scale"
                    style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative">
                        <Image
                          src={trader.avatar_url}
                          alt={trader.username}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                          style={{ width: 32, height: 32 }}
                          unoptimized
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-2.5 rounded-sm overflow-hidden"
                             style={{ border: "1px solid #0A0B0F" }}>
                          <Image src={trader.country_flag} alt="" width={14} height={10}
                                 className="w-full h-full object-cover" unoptimized />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium truncate" style={{ color: "#F1F5F9" }}>
                          {trader.username}
                        </div>
                        <div className="text-[9px]" style={{ color: "#94A3B8" }}>
                          {trader.markets_played} trades
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold" style={{ color: "#22C55E" }}>
                      +${(trader.total_volume * trader.roi_pct / 100 / 1000).toFixed(1)}K
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── FIFA World Cup ── */}
          <section className="px-4 mt-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚽</span>
              <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                World Cup
              </span>
              <Link href="/markets" className="ml-auto flex items-center gap-0.5"
                    onClick={() => setCategory("FIFA 2026")}>
                <ChevronRight className="w-4 h-4" style={{ color: "#475569" }} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {FIFA_MATCHUPS.map((m, i) => (
                <MatchupCard key={m.id} matchup={m} index={i} />
              ))}
            </div>
          </section>

          {/* ── Live Games ── */}
          <section className="px-4 mt-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#EF4444" }} />
              <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                Live Games
              </span>
              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: "#475569" }} />
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {FIFA_MATCHUPS.filter((m) => m.isLive).concat(FIFA_MATCHUPS.slice(0, 3)).map((m, i) => (
                <MatchupCard key={`live-${m.id}-${i}`} matchup={{ ...m, label: m.isLive ? "🔴 LIVE" : m.label }} index={i} />
              ))}
            </div>
          </section>

          {/* ── Crypto Markets ── */}
          <section className="px-4 mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png"
                alt="Crypto"
                width={16}
                height={16}
                className="rounded-full"
                unoptimized
              />
              <span className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>
                Crypto Markets
              </span>
              <button className="ml-auto flex items-center gap-0.5"
                      onClick={() => setCategory("Crypto")}>
                <ChevronRight className="w-4 h-4" style={{ color: "#475569" }} />
              </button>
            </div>
            {isLoading ? (
              <MarketListSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {cryptoMarkets.map((market, i) => (
                  <MarketCard key={market.id} market={market} index={i} />
                ))}
              </div>
            )}
          </section>

          <div className="h-4" />
        </div>
      ) : (
        /* ── Filtered / search view ── */
        <div>
          <CategoryTabs active={category} onChange={setCategory} />
          <MarketSearch search={search} onSearch={setSearch} sort={sort} onSort={setSort} />
          {isLoading ? (
            <MarketListSkeleton count={6} />
          ) : (
            <MarketList markets={filtered} />
          )}
        </div>
      )}

      {/* ── Category tabs + search always visible at top for non-home ── */}
      {isHome && (
        <div className="sticky bottom-20 px-4 pb-2" style={{ background: "linear-gradient(transparent, #0A0B0F)" }}>
          <button
            onClick={() => setSearch("")}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
          >
            <Zap className="w-4 h-4" style={{ color: "#3B82F6" }} />
            <span className="text-sm" style={{ color: "#94A3B8" }}>Search markets</span>
          </button>
        </div>
      )}
    </PageWrapper>
  );
}
