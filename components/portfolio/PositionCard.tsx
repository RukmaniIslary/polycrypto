"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Position } from "@/types";
import { formatUSDT, formatPnL, cn } from "@/lib/utils";

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const market = position.market;
  const currentPrice = position.side === "YES"
    ? (market?.yes_probability ?? position.avg_price)
    : 1 - (market?.yes_probability ?? 1 - position.avg_price);

  const currentValue = position.shares * currentPrice;
  const invested = position.shares * position.avg_price;
  const pnl = currentValue - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
  const isUp = pnl >= 0;

  return (
    <Link href={market ? `/markets/${market.id}` : "#"}>
      <div className="bg-bg-surface border border-border rounded-2xl p-4 tap-scale hover:border-border/80 transition-colors">
        {/* Question */}
        <p className="text-sm font-medium text-text-primary line-clamp-2 mb-3 leading-snug">
          {market?.question ?? "Unknown market"}
        </p>

        {/* Position info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                position.side === "YES"
                  ? "bg-accent-green/15 text-accent-green"
                  : "bg-accent-red/15 text-accent-red"
              )}
            >
              {position.side}
            </span>
            <span className="text-xs text-text-secondary font-mono">
              {position.shares.toFixed(2)} shares @ {Math.round(position.avg_price * 100)}¢
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-accent-red" />
            )}
            <span className={cn("text-xs font-mono font-semibold", isUp ? "text-accent-green" : "text-accent-red")}>
              {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Value row */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-secondary">
            Value: <span className="text-text-primary">{formatUSDT(currentValue)}</span>
          </span>
          <span className={isUp ? "text-accent-green" : "text-accent-red"}>
            P&L: {formatPnL(pnl)}
          </span>
        </div>

        {/* Current price bar */}
        <div className="mt-3">
          <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", isUp ? "progress-bar-yes" : "progress-bar-no")}
              style={{ width: `${Math.round(currentPrice * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-text-dim">
            <span>Current: {Math.round(currentPrice * 100)}¢</span>
            <span>Avg: {Math.round(position.avg_price * 100)}¢</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
