"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Image from "next/image";
import { Trophy, Flame, Zap, Star } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { FAKE_LEADERBOARD, type FakeTrader } from "@/lib/mock-data";
import { formatUSDT, cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/useTelegram";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";

const PERIODS = ["Weekly", "Monthly", "All-time"] as const;
type Period = (typeof PERIODS)[number];

// Shuffle ROI slightly per period to make it feel dynamic
function forPeriod(entries: FakeTrader[], period: Period): FakeTrader[] {
  const multiplier = period === "Weekly" ? 1 : period === "Monthly" ? 1.4 : 2.1;
  return entries.map((e, i) => ({
    ...e,
    roi_pct: parseFloat((e.roi_pct * multiplier * (0.9 + Math.sin(i) * 0.1)).toFixed(1)),
    total_volume: Math.round(e.total_volume * multiplier),
  }));
}

const BADGE_CONFIG = {
  whale: { label: "Whale", icon: <Star className="w-2.5 h-2.5" />, color: "bg-accent-purple/20 text-accent-purple" },
  hot:   { label: "Hot",   icon: <Flame className="w-2.5 h-2.5" />, color: "bg-accent-red/20 text-accent-red" },
  new:   { label: "New",   icon: <Zap className="w-2.5 h-2.5" />,   color: "bg-accent-amber/20 text-accent-amber" },
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("Weekly");
  const { haptic } = useTelegram();
  const { user: privyUser } = usePrivy();

  const entries = forPeriod(FAKE_LEADERBOARD, period);
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
               style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}>
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: "#F1F5F9" }}>Leaderboard</h1>
            <p className="text-xs" style={{ color: "#94A3B8" }}>Top predictors by ROI</p>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex rounded-xl p-0.5 gap-0.5" style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => { haptic.select(); setPeriod(p); }}
              className={cn(
                "flex-1 py-2 text-xs font-medium rounded-[10px] transition-all tap-scale",
                period === p ? "text-white" : "text-[#94A3B8]"
              )}
              style={period === p ? { backgroundColor: "#3B82F6" } : {}}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Podium — top 3 */}
      <div className="px-4 mb-5">
        <div className="rounded-2xl p-4 relative overflow-hidden"
             style={{ background: "linear-gradient(135deg,#1A1D26,#12141A)", border: "1px solid #252836" }}>
          {/* background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full opacity-20 blur-3xl"
               style={{ background: "radial-gradient(circle,#F59E0B,transparent)" }} />

          <div className="flex items-end justify-center gap-4 relative z-10">
            {/* 2nd place */}
            <PodiumSpot entry={top3[1]} position={2} />
            {/* 1st place */}
            <PodiumSpot entry={top3[0]} position={1} />
            {/* 3rd place */}
            <PodiumSpot entry={top3[2]} position={3} />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto no-scrollbar">
        {[
          { label: "Total Traders", value: "15,420" },
          { label: "Total Volume",  value: "$48.2M" },
          { label: "Avg ROI",       value: "+94.7%" },
        ].map((s) => (
          <div key={s.label} className="shrink-0 rounded-xl px-4 py-2.5 text-center"
               style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}>
            <div className="font-mono text-sm font-semibold" style={{ color: "#F1F5F9" }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: "#94A3B8" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ranks 4–15 */}
      <div className="flex flex-col px-4 gap-2 pb-4">
        {rest.map((entry) => (
          <LeaderRow
            key={entry.user_id}
            entry={entry}
            isCurrentUser={entry.user_id === privyUser?.id}
          />
        ))}
      </div>

      {/* Your rank placeholder */}
      {privyUser && (
        <div className="sticky bottom-24 mx-4 mb-2">
          <div className="rounded-xl p-3 flex items-center justify-between"
               style={{ backgroundColor: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <span className="text-sm font-medium" style={{ color: "#3B82F6" }}>Your rank: Unranked</span>
            <span className="text-xs" style={{ color: "#94A3B8" }}>Place a trade to rank</span>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function PodiumSpot({ entry, position }: { entry: FakeTrader; position: 1 | 2 | 3 }) {
  const medalColors = {
    1: "#F59E0B",
    2: "#94A3B8",
    3: "#CD7F32",
  };
  const podiumHeights = { 1: "h-20", 2: "h-14", 3: "h-10" };
  const avatarSize = position === 1 ? 52 : 40;
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className={cn("flex flex-col items-center gap-1", position === 1 && "-mt-3")}>
      <span className="text-lg mb-0.5">{medals[position]}</span>

      {/* Avatar with flag overlay */}
      <div className="relative">
        <Image
          src={entry.avatar_url}
          alt={entry.username}
          width={avatarSize}
          height={avatarSize}
          className="rounded-full object-cover"
          style={{
            width: avatarSize,
            height: avatarSize,
            border: `2px solid ${medalColors[position]}`,
          }}
          unoptimized
        />
        {/* Country flag badge */}
        <div className="absolute -bottom-1 -right-1 rounded-sm overflow-hidden shadow-md"
             style={{ width: 16, height: 12 }}>
          <Image
            src={entry.country_flag}
            alt="flag"
            width={16}
            height={12}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      </div>

      <span className="text-[10px] font-medium max-w-[64px] truncate text-center" style={{ color: "#F1F5F9" }}>
        {entry.username}
      </span>
      <span className="text-xs font-mono font-bold" style={{ color: "#22C55E" }}>
        +{entry.roi_pct.toFixed(0)}%
      </span>

      {/* Podium block */}
      <div
        className={cn("w-16 rounded-t-lg mt-1", podiumHeights[position])}
        style={{
          background: `linear-gradient(180deg, ${medalColors[position]}33, ${medalColors[position]}11)`,
          border: `1px solid ${medalColors[position]}44`,
        }}
      />
    </div>
  );
}

function LeaderRow({ entry, isCurrentUser }: { entry: FakeTrader; isCurrentUser: boolean }) {
  const badge = entry.badge ? BADGE_CONFIG[entry.badge] : null;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{
        backgroundColor: isCurrentUser ? "rgba(59,130,246,0.1)" : "#12141A",
        border: isCurrentUser ? "1px solid rgba(59,130,246,0.3)" : "1px solid #252836",
      }}
    >
      {/* Rank */}
      <span className="font-mono text-xs w-5 text-center shrink-0" style={{ color: "#475569" }}>
        {entry.rank}
      </span>

      {/* Avatar + flag */}
      <div className="relative shrink-0">
        <Image
          src={entry.avatar_url}
          alt={entry.username}
          width={36}
          height={36}
          className="rounded-full object-cover"
          style={{ width: 36, height: 36 }}
          unoptimized
        />
        <div className="absolute -bottom-0.5 -right-0.5 rounded-sm overflow-hidden shadow"
             style={{ width: 13, height: 10 }}>
          <Image
            src={entry.country_flag}
            alt="flag"
            width={13}
            height={10}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      </div>

      {/* Name + stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>
            {entry.username}
          </span>
          {badge && (
            <span className={cn("flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full", badge.color)}>
              {badge.icon}{badge.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono" style={{ color: "#475569" }}>
            {entry.markets_played} markets
          </span>
          <span className="text-[10px]" style={{ color: "#475569" }}>
            {entry.win_rate}% win
          </span>
        </div>
      </div>

      {/* ROI + volume */}
      <div className="text-right shrink-0">
        <div
          className="text-sm font-mono font-bold"
          style={{ color: entry.roi_pct >= 0 ? "#22C55E" : "#EF4444" }}
        >
          {entry.roi_pct >= 0 ? "+" : ""}{entry.roi_pct.toFixed(1)}%
        </div>
        <div className="text-[10px] font-mono" style={{ color: "#475569" }}>
          {formatUSDT(entry.total_volume)}
        </div>
      </div>
    </div>
  );
}
