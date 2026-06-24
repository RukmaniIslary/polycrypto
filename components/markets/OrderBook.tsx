"use client";

import type { Market } from "@/types";
import { formatPricePerShare } from "@/lib/utils";

interface OrderBookProps {
  market: Market;
}

function generateOrderBook(yesProbability: number) {
  const price = yesProbability;
  const bids = Array.from({ length: 5 }, (_, i) => ({
    price: price - i * 0.01 - 0.005,
    size: Math.round(Math.random() * 5000 + 500),
    total: 0,
  }));
  const asks = Array.from({ length: 5 }, (_, i) => ({
    price: price + i * 0.01 + 0.005,
    size: Math.round(Math.random() * 5000 + 500),
    total: 0,
  }));

  let bidTotal = 0;
  bids.forEach((b) => { bidTotal += b.size; b.total = bidTotal; });
  let askTotal = 0;
  asks.forEach((a) => { askTotal += a.size; a.total = askTotal; });

  return { bids, asks, spread: asks[0].price - bids[0].price };
}

export function OrderBook({ market }: OrderBookProps) {
  const { bids, asks, spread } = generateOrderBook(market.yes_probability);
  const maxTotal = Math.max(...bids.map((b) => b.total), ...asks.map((a) => a.total));

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-4 mx-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">Order Book</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Bids (YES buyers) */}
        <div>
          <div className="flex justify-between text-[10px] text-text-dim mb-1.5 px-1">
            <span>Price</span><span>Size</span>
          </div>
          {bids.map((b, i) => (
            <div key={i} className="relative flex justify-between text-xs py-0.5 px-1">
              <div
                className="absolute inset-0 rounded opacity-20"
                style={{ width: `${(b.total / maxTotal) * 100}%`, background: "rgba(34,197,94,0.4)" }}
              />
              <span className="relative text-accent-green font-mono">{formatPricePerShare(b.price)}</span>
              <span className="relative text-text-secondary font-mono">{b.size.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Asks (NO buyers / YES sellers) */}
        <div>
          <div className="flex justify-between text-[10px] text-text-dim mb-1.5 px-1">
            <span>Price</span><span>Size</span>
          </div>
          {asks.map((a, i) => (
            <div key={i} className="relative flex justify-between text-xs py-0.5 px-1">
              <div
                className="absolute inset-0 rounded opacity-20"
                style={{ width: `${(a.total / maxTotal) * 100}%`, background: "rgba(239,68,68,0.4)" }}
              />
              <span className="relative text-accent-red font-mono">{formatPricePerShare(a.price)}</span>
              <span className="relative text-text-secondary font-mono">{a.size.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spread */}
      <div className="mt-2 text-center text-[10px] text-text-dim">
        Spread: {formatPricePerShare(spread)}
      </div>
    </div>
  );
}
