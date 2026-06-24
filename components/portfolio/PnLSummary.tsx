"use client";

import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { formatUSDT, formatPnL, cn } from "@/lib/utils";

interface PnLSummaryProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalPnL: number;
  roi: number;
}

export function PnLSummary({ totalInvested, totalCurrentValue, totalPnL, roi }: PnLSummaryProps) {
  const isUp = totalPnL >= 0;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-4 mx-4">
      <h3 className="text-sm font-semibold text-text-secondary mb-3">Portfolio Overview</h3>

      {/* Main P&L */}
      <div className="flex items-end gap-2 mb-4">
        <div className="text-3xl font-display font-700 text-text-primary">
          {formatUSDT(totalCurrentValue)}
        </div>
        <div className={cn("flex items-center gap-1 text-sm font-medium mb-1", isUp ? "text-accent-green" : "text-accent-red")}>
          {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {formatPnL(totalPnL)} ({roi >= 0 ? "+" : ""}{roi.toFixed(1)}%)
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-text-dim" />}
          label="Invested"
          value={formatUSDT(totalInvested)}
        />
        <StatCard
          icon={<Target className="w-4 h-4 text-text-dim" />}
          label="Total P&L"
          value={formatPnL(totalPnL)}
          valueClass={isUp ? "text-accent-green" : "text-accent-red"}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, valueClass }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-bg-elevated rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className={cn("font-mono font-semibold text-sm", valueClass ?? "text-text-primary")}>
        {value}
      </div>
    </div>
  );
}
