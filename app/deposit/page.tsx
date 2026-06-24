"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DepositModal } from "@/components/binance/DepositModal";
import { WithdrawModal } from "@/components/binance/WithdrawModal";
import { BalanceWidget } from "@/components/binance/BalanceWidget";
import { LoginGate } from "@/components/auth/LoginGate";
import { useTelegram } from "@/hooks/useTelegram";
import { cn } from "@/lib/utils";

function DepositContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "withdraw" ? "withdraw" : "deposit";
  const [tab, setTab] = useState<"deposit" | "withdraw">(defaultTab as "deposit" | "withdraw");
  const { haptic } = useTelegram();

  return (
    <PageWrapper>
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display text-xl font-700 text-text-primary mb-4">Funds</h1>
        <BalanceWidget />
      </div>

      {/* Tab */}
      <div className="flex bg-bg-surface border border-border rounded-xl p-0.5 mx-4 my-4">
        {(["deposit", "withdraw"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { haptic.select(); setTab(t); }}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium rounded-[10px] capitalize transition-colors",
              tab === t ? "bg-accent-blue text-white" : "text-text-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "deposit" ? <DepositModal /> : <WithdrawModal />}

      <div className="px-4 mt-4 p-4 bg-bg-surface border border-border rounded-2xl mx-4">
        <h4 className="text-sm font-semibold text-text-primary mb-2">How it works</h4>
        <ol className="flex flex-col gap-2 text-xs text-text-secondary list-decimal list-inside">
          <li>Connect your Binance account via API key</li>
          <li>Send USDT to the deposit address</li>
          <li>Balance updates automatically within minutes</li>
          <li>Use your balance to trade any prediction market</li>
        </ol>
      </div>
    </PageWrapper>
  );
}

export default function DepositPage() {
  return (
    <LoginGate>
      <Suspense fallback={null}>
        <DepositContent />
      </Suspense>
    </LoginGate>
  );
}
