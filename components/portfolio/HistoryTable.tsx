"use client";

import type { Order } from "@/types";
import { formatUSDT, formatDateTime, cn } from "@/lib/utils";

interface HistoryTableProps {
  orders: Order[];
}

export function HistoryTable({ orders }: HistoryTableProps) {
  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-text-secondary text-sm">
        No trade history yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-bg-surface border border-border rounded-xl p-3 flex items-center justify-between"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                  order.side === "YES"
                    ? "bg-accent-green/15 text-accent-green"
                    : "bg-accent-red/15 text-accent-red"
                )}
              >
                {order.side}
              </span>
              <span className="text-xs text-text-secondary font-mono">
                {order.shares.toFixed(2)} shares
              </span>
            </div>
            <span className="text-[10px] text-text-dim">{formatDateTime(order.created_at)}</span>
          </div>

          <div className="text-right">
            <div className="text-sm font-mono font-medium text-text-primary">
              {formatUSDT(order.total_cost_usdt)}
            </div>
            <div className="text-[10px] text-text-dim">
              @ {Math.round(order.price_per_share * 100)}¢
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
