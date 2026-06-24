// v2.0 — No Privy, custom auth, working trades
"use client";

export const dynamic = "force-dynamic";

import { use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Users, ExternalLink } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PriceChart } from "@/components/markets/PriceChart";
import { OrderBook } from "@/components/markets/OrderBook";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { useMarket } from "@/hooks/useMarkets";
import { useTelegram } from "@/hooks/useTelegram";
import { formatUSDT, formatDate, formatTimeRemaining, categoryColor, cn } from "@/lib/utils";

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: market, isLoading } = useMarket(id);
  const { haptic } = useTelegram();
  const router = useRouter();
  const isFifa = market?.category === "FIFA 2026";

  return (
    <PageWrapper>
      {/* Back button */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => { haptic.impact("light"); router.back(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full tap-scale"
          style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: "#94A3B8" }} />
        </button>
        <span className="text-sm font-medium" style={{ color: "#94A3B8" }}>Market</span>
      </div>

      {isLoading || !market ? (
        <div className="px-4 flex flex-col gap-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-4">
          {/* Hero banner for FIFA markets */}
          {market.flag_url && isFifa && (
            <div className="mx-4 rounded-2xl overflow-hidden h-28 relative"
                 style={{ border: "1px solid #252836" }}>
              <Image
                src={market.flag_url}
                alt={market.category}
                fill
                className="object-cover"
                style={{ opacity: 0.45 }}
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center"
                   style={{ background: "linear-gradient(180deg,transparent,rgba(10,11,15,0.85))" }}>
                <div className="text-center">
                  <div className="text-3xl mb-1">⚽</div>
                  <div className="text-xs font-semibold" style={{ color: "#22C55E" }}>FIFA World Cup 2026</div>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="px-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Flag or coin icon */}
              {market.flag_url && isFifa && (
                <Image src={market.flag_url} alt="flag" width={28} height={20}
                  className="rounded-sm object-cover" unoptimized />
              )}
              {market.image_url && !isFifa && (
                <Image src={market.image_url} alt={market.category} width={20} height={20}
                  className="rounded-full" unoptimized />
              )}
              <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", categoryColor(market.category))}>
                {market.category}
              </span>
              <div className="flex items-center gap-1 text-xs" style={{ color: "#475569" }}>
                <Clock className="w-3 h-3" />
                {formatTimeRemaining(market.closes_at)} left
              </div>
            </div>

            <h1 className="font-display text-xl font-bold leading-snug mb-3" style={{ color: "#F1F5F9" }}>
              {market.question}
            </h1>

            <div className="flex items-center gap-4 text-xs" style={{ color: "#94A3B8" }}>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {market.trader_count.toLocaleString()} traders
              </div>
              <span>Vol: <span className="font-mono" style={{ color: "#F1F5F9" }}>{formatUSDT(market.volume_usdt)}</span></span>
              <span>Liq: <span className="font-mono" style={{ color: "#F1F5F9" }}>{formatUSDT(market.liquidity_usdt)}</span></span>
            </div>
          </div>

          {/* Chart */}
          <PriceChart data={[]} currentProbability={market.yes_probability} />

          {/* Order Book */}
          <OrderBook market={market} />

          {/* Trading Panel */}
          <TradingPanel market={market} />

          {/* Market Details */}
          <div className="rounded-2xl p-4 mx-4" style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#F1F5F9" }}>Market Details</h3>
            <div className="flex flex-col gap-2 text-xs">
              <DetailRow label="Resolves" value={formatDate(market.resolves_at ?? market.closes_at)} />
              <DetailRow label="Closes"   value={formatDate(market.closes_at)} />
              {market.resolution_source && (
                <div className="flex items-center justify-between">
                  <span style={{ color: "#94A3B8" }}>Resolution source</span>
                  <a href={market.resolution_source} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-1" style={{ color: "#3B82F6" }}>
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              <DetailRow label="Status" value={market.resolved ? "Resolved" : "Active"} />
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: "#94A3B8" }}>{label}</span>
      <span className="font-mono" style={{ color: "#F1F5F9" }}>{value}</span>
    </div>
  );
}
