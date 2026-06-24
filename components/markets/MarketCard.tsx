"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { Market } from "@/types";
import { formatUSDT, formatTimeRemaining, categoryColor, cn } from "@/lib/utils";
import { ProbabilityBar } from "@/components/ui/PriceTag";
import { useTelegram } from "@/hooks/useTelegram";

interface MarketCardProps {
  market: Market;
  index?: number;
}

export function MarketCard({ market, index = 0 }: MarketCardProps) {
  const { haptic } = useTelegram();
  const timeLeft = formatTimeRemaining(market.closes_at);
  const isFifa = market.category === "FIFA 2026";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <Link
        href={`/markets/${market.id}`}
        onClick={() => haptic.impact("light")}
        className="block"
      >
        <div
          className={cn(
            "rounded-2xl p-3.5 flex flex-col gap-2.5 tap-scale transition-colors overflow-hidden",
            isFifa
              ? "border border-green-500/30 hover:border-green-400/50"
              : "border border-[#252836] hover:border-[#3B82F6]/30"
          )}
          style={{ backgroundColor: "#12141A" }}
        >
          {/* Image + category header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Real image */}
              {market.image_url && (
                <div className={cn(
                  "shrink-0 overflow-hidden",
                  isFifa
                    ? "w-8 h-6 rounded-sm shadow-sm"   // flag: wide rectangle
                    : "w-7 h-7 rounded-full"            // coin: circle
                )}>
                  <Image
                    src={market.image_url}
                    alt={market.category}
                    width={isFifa ? 40 : 28}
                    height={isFifa ? 28 : 28}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <span className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                categoryColor(market.category)
              )}>
                {market.category}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0" style={{ color: "#475569" }}>
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{timeLeft}</span>
            </div>
          </div>

          {/* Question */}
          <p className="text-xs font-medium leading-snug line-clamp-3" style={{ color: "#F1F5F9" }}>
            {market.question}
          </p>

          {/* Probability bar */}
          <ProbabilityBar probability={market.yes_probability} />

          {/* Stats */}
          <div className="flex items-center justify-between text-[10px]" style={{ color: "#94A3B8" }}>
            <span className="font-mono">Vol {formatUSDT(market.volume_usdt)}</span>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{(market.trader_count ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
