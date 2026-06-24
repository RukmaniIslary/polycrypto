"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PositionCard } from "@/components/portfolio/PositionCard";
import { HistoryTable } from "@/components/portfolio/HistoryTable";
import { PnLSummary } from "@/components/portfolio/PnLSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { LoginGate } from "@/components/auth/LoginGate";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useTelegram } from "@/hooks/useTelegram";
import { cn } from "@/lib/utils";

const TABS = ["Active", "History", "Stats"] as const;
type Tab = (typeof TABS)[number];

export default function PortfolioPage() {
  const [tab, setTab] = useState<Tab>("Active");
  const { positions, history, stats } = usePortfolio();
  const { haptic } = useTelegram();

  return (
    <LoginGate>
      <PageWrapper>
        <div className="px-4 pt-4 pb-2">
          <h1 className="font-display text-xl font-700 text-text-primary mb-4">Portfolio</h1>

          {/* Tab bar */}
          <div className="flex bg-bg-surface border border-border rounded-xl p-0.5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => { haptic.select(); setTab(t); }}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-[10px] transition-colors",
                  tab === t ? "bg-accent-blue text-white" : "text-text-secondary"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "Active" && (
            <div className="flex flex-col gap-3 px-4 pt-3">
              {positions.isLoading ? (
                <LoadingSkeleton lines={4} />
              ) : (positions.data ?? []).length === 0 ? (
                <EmptyState
                  icon="chart"
                  title="No active positions"
                  description="Start trading to build your portfolio"
                />
              ) : (
                (positions.data ?? []).map((pos) => (
                  <PositionCard key={pos.id} position={pos} />
                ))
              )}
            </div>
          )}

          {tab === "History" && (
            <div className="pt-3">
              {history.isLoading ? (
                <LoadingSkeleton className="px-4" lines={4} />
              ) : (
                <HistoryTable orders={history.data ?? []} />
              )}
            </div>
          )}

          {tab === "Stats" && (
            <div className="pt-3">
              <PnLSummary {...stats} />
            </div>
          )}
        </motion.div>
      </PageWrapper>
    </LoginGate>
  );
}
