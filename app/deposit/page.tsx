"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { WalletDepositModal } from "@/components/binance/WalletDepositModal";
import { WithdrawModal } from "@/components/binance/WithdrawModal";
import { BalanceWidget } from "@/components/binance/BalanceWidget";
import { LoginGate } from "@/components/auth/LoginGate";
import { useTelegram } from "@/hooks/useTelegram";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

function DepositContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "withdraw" ? "withdraw" : "deposit";
  const [tab, setTab] = useState<"deposit" | "withdraw">(defaultTab as "deposit" | "withdraw");
  const [modalOpen, setModalOpen] = useState(false);
  const { haptic } = useTelegram();
  const queryClient = useQueryClient();

  const handleSuccess = (amount: number) => {
    // Refresh balance after deposit
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["binance-balance"] });
  };

  return (
    <PageWrapper>
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-display text-xl font-bold text-text-primary mb-4">Funds</h1>
        <BalanceWidget />
      </div>

      {/* Tabs */}
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

      {tab === "deposit" ? (
        <div className="px-4 flex flex-col gap-3">
          {/* Wallet connect deposit button */}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-between p-5 rounded-2xl tap-scale"
            style={{ backgroundColor: "#1A1D26", border: "1.5px solid #3B82F6" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: "rgba(59,130,246,0.15)" }}>
                💎
              </div>
              <div className="text-left">
                <p className="font-bold text-base" style={{ color: "#F1F5F9" }}>Connect Wallet</p>
                <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                  MetaMask, Trust, Coinbase & more
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#3B82F6" }}>
              <span style={{ color: "white", fontSize: 18 }}>→</span>
            </div>
          </button>

          {/* Supported wallets preview */}
          <div className="flex items-center gap-2 px-1">
            {["🦊", "🔵", "🟡", "🌈", "👛"].map((icon, i) => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}>
                {icon}
              </div>
            ))}
            <span className="text-xs ml-1" style={{ color: "#64748B" }}>+100 more wallets</span>
          </div>

          <div className="p-4 rounded-2xl text-xs" style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}>
            <p className="font-semibold mb-2" style={{ color: "#F1F5F9" }}>Supported networks</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span style={{ color: "#94A3B8" }}>🟣 Polygon — USDT</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#22C55E" }}>Recommended</span>
              </div>
              <div style={{ color: "#94A3B8" }}>🟡 BNB Chain — USDT</div>
              <div style={{ color: "#94A3B8" }}>🔵 Ethereum — USDT</div>
            </div>
          </div>

          <p className="text-center text-xs px-4" style={{ color: "#475569" }}>
            🔒 Non-custodial · Secured by smart contracts · Min $1 USDT
          </p>
        </div>
      ) : (
        <WithdrawModal />
      )}

      <WalletDepositModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
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
