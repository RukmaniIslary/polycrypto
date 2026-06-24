"use client";

import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw } from "lucide-react";
import { useBinanceBalance } from "@/hooks/useBinanceBalance";
import { useAppStore } from "@/store/useAppStore";
import { formatUSDT } from "@/lib/utils";

export function BalanceWidget() {
  const { data: binanceBalance, isFetching, refetch } = useBinanceBalance();
  const user = useAppStore((s) => s.user);
  const platformBalance = user?.usdt_balance ?? 0;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-4 mx-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary font-medium">Your Balance</span>
        <button
          onClick={() => refetch()}
          className={`text-text-dim tap-scale ${isFetching ? "animate-spin" : ""}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-display font-700 text-text-primary">
          {formatUSDT(platformBalance, 2)}
        </div>
        <div className="text-xs text-text-dim mt-0.5">Platform balance (USDT)</div>
        {binanceBalance !== undefined && (
          <div className="text-xs text-text-secondary mt-1">
            Binance: <span className="font-mono text-accent-green">{formatUSDT(binanceBalance)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href="/deposit"
          className="flex-1 flex items-center justify-center gap-2 bg-accent-blue/15 border border-accent-blue/30 text-accent-blue font-medium text-sm py-2.5 rounded-xl tap-scale"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Deposit
        </Link>
        <Link
          href="/deposit?tab=withdraw"
          className="flex-1 flex items-center justify-center gap-2 bg-bg-elevated border border-border text-text-secondary font-medium text-sm py-2.5 rounded-xl tap-scale"
        >
          <ArrowUpFromLine className="w-4 h-4" />
          Withdraw
        </Link>
      </div>
    </div>
  );
}
