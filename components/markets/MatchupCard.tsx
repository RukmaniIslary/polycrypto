"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Matchup } from "@/lib/mock-data";
import { formatUSDT } from "@/lib/utils";
import { useTelegram } from "@/hooks/useTelegram";

interface MatchupCardProps {
  matchup: Matchup;
  index?: number;
}

export function MatchupCard({ matchup, index = 0 }: MatchupCardProps) {
  const { haptic } = useTelegram();
  const { teamA, teamB } = matchup;
  const pctA = Math.round(teamA.prob * 100);
  const pctB = Math.round(teamB.prob * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25 }}
      className="shrink-0 w-[200px]"
    >
      <Link href={`/markets/${matchup.market_id}`} onClick={() => haptic.impact("light")}>
        <div
          className="rounded-2xl p-3.5 tap-scale"
          style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
        >
          {/* Live/time label */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={matchup.isLive
                ? { backgroundColor: "rgba(239,68,68,0.15)", color: "#EF4444" }
                : { backgroundColor: "rgba(59,130,246,0.12)", color: "#3B82F6" }
              }
            >
              {matchup.label}
            </span>
            <span className="text-[9px] font-mono" style={{ color: "#475569" }}>
              {formatUSDT(matchup.volume_usdt)}
            </span>
          </div>

          {/* Flags + VS */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Team A */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-12 h-9 rounded-lg overflow-hidden shadow-lg"
                   style={{ border: "1px solid #252836" }}>
                <Image
                  src={teamA.flag}
                  alt={teamA.name}
                  width={48}
                  height={36}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <span className="text-[11px] font-bold" style={{ color: "#F1F5F9" }}>
                {teamA.short}
              </span>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-bold" style={{ color: "#475569" }}>VS</span>
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-12 h-9 rounded-lg overflow-hidden shadow-lg"
                   style={{ border: "1px solid #252836" }}>
                <Image
                  src={teamB.flag}
                  alt={teamB.name}
                  width={48}
                  height={36}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <span className="text-[11px] font-bold" style={{ color: "#F1F5F9" }}>
                {teamB.short}
              </span>
            </div>
          </div>

          {/* Probability bar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-semibold w-6 text-right"
                  style={{ color: "#22C55E" }}>{pctA}%</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                 style={{ backgroundColor: "#252836" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pctA}%`,
                  background: "linear-gradient(90deg, #22C55E, #3B82F6)",
                }}
              />
            </div>
            <span className="text-[10px] font-mono font-semibold w-6"
                  style={{ color: "#3B82F6" }}>{pctB}%</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
