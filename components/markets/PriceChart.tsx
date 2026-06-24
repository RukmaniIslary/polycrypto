"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { PricePoint } from "@/types";
import { Skeleton } from "@/components/ui/LoadingSkeleton";

const PERIODS = ["1H", "1D", "1W", "1M", "ALL"] as const;
type Period = (typeof PERIODS)[number];

interface PriceChartProps {
  data: PricePoint[];
  currentProbability: number;
  isLoading?: boolean;
}

function generateMockHistory(current: number, points: number): PricePoint[] {
  const now = Date.now();
  const step = (24 * 60 * 60 * 1000) / points;
  let prob = current;
  return Array.from({ length: points }, (_, i) => {
    prob = Math.max(0.01, Math.min(0.99, prob + (Math.random() - 0.5) * 0.04));
    return { time: now - (points - i) * step, yes_probability: prob, volume: Math.random() * 50000 };
  });
}

export function PriceChart({ data, currentProbability, isLoading }: PriceChartProps) {
  const [period, setPeriod] = useState<Period>("1D");

  const chartData = data.length > 0 ? data : generateMockHistory(currentProbability, 48);
  const pct = Math.round(currentProbability * 100);

  if (isLoading) return <Skeleton className="h-48 w-full mx-4 rounded-2xl" />;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-4 mx-4">
      {/* Probability display */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-4xl font-display font-bold text-accent-green">{pct}%</div>
          <div className="text-xs text-text-secondary">Chance of YES</div>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-lg font-medium transition-colors",
                period === p
                  ? "bg-accent-blue text-white"
                  : "text-text-dim hover:text-text-secondary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="yesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 1]} hide />
            <Tooltip
              contentStyle={{
                background: "#1A1D26",
                border: "1px solid #252836",
                borderRadius: 8,
                fontSize: 12,
                color: "#F1F5F9",
              }}
              formatter={(value) => [`${Math.round(Number(value) * 100)}%`, "YES"]}
              labelFormatter={() => ""}
            />
            <Area
              type="monotone"
              dataKey="yes_probability"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#yesGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#22C55E" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
