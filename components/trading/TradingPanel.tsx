"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import { Zap, AlertTriangle, CheckCircle2, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import type { Market } from "@/types";
import { usePrivySafe } from "@/lib/privy-safe";
import { useTelegram } from "@/hooks/useTelegram";
import { calcSharesReceived, formatUSDT, cn } from "@/lib/utils";

const schema = z.object({
  amount: z.number({ invalid_type_error: "Enter an amount" }).positive().min(1, "Minimum $1"),
});
type FormValues = z.infer<typeof schema>;

// Demo balance stored in sessionStorage so it persists across page navigations
function getDemoBalance(): number {
  if (typeof window === "undefined") return 1000;
  return parseFloat(sessionStorage.getItem("demo_balance") ?? "1000");
}
function setDemoBalance(v: number) {
  if (typeof window !== "undefined") sessionStorage.setItem("demo_balance", String(v));
}

export function TradingPanel({ market }: { market: Market }) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [step, setStep] = useState<"input" | "confirm" | "success">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [demoBalance, setDemoBalanceState] = useState(getDemoBalance);

  const { authenticated, login } = usePrivySafe();
  const { haptic, mainButton } = useTelegram();

  const price = side === "YES" ? market.yes_probability : 1 - market.yes_probability;
  const liquidity = market.liquidity_usdt;

  const { register, watch, setValue, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const amount = watch("amount") || 0;
  const sharesReceived = calcSharesReceived(amount, liquidity || 100000);
  const potentialWin = sharesReceived - amount;
  const slippage = liquidity > 0 ? (amount / liquidity) * 100 : 0;

  // Telegram MainButton sync
  const confirmRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!mainButton || step !== "confirm") return;
    mainButton.setText(`Confirm ${side} — $${amount.toFixed(2)}`);
    mainButton.setParams({ color: "#3B82F6", is_active: true, is_visible: true });
    const cb = () => confirmRef.current?.();
    mainButton.onClick(cb);
    return () => { mainButton.hide(); mainButton.offClick(cb); };
  }, [mainButton, step, side, amount]);

  const handleConfirm = useCallback(async () => {
    if (!amount) return;
    setIsLoading(true);
    haptic.impact("heavy");

    try {
      // Optimistic local trade — works without Supabase
      await new Promise((r) => setTimeout(r, 800)); // simulate network
      const newBalance = demoBalance - amount;
      setDemoBalance(newBalance);
      setDemoBalanceState(newBalance);

      haptic.notify("success");
      setStep("success");
      mainButton?.hide();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.75 },
        colors: side === "YES" ? ["#22C55E", "#16A34A", "#F1F5F9"] : ["#EF4444", "#DC2626", "#F1F5F9"],
      });

      setTimeout(() => { setStep("input"); reset(); }, 3000);
    } catch {
      haptic.notify("error");
      setStep("input");
    } finally {
      setIsLoading(false);
    }
  }, [amount, demoBalance, side, haptic, mainButton, reset]);

  useEffect(() => { confirmRef.current = handleConfirm; }, [handleConfirm]);

  // Show login prompt if not authenticated
  if (!authenticated) {
    return (
      <div
        className="mx-4 rounded-2xl p-5"
        style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
      >
        <div className="text-center mb-4">
          <div className="text-2xl mb-2">{side === "YES" ? "📈" : "📉"}</div>
          <p className="font-semibold mb-1" style={{ color: "#F1F5F9" }}>Sign in to Trade</p>
          <p className="text-xs" style={{ color: "#94A3B8" }}>
            Place your prediction on this market
          </p>
        </div>

        {/* Preview of what they'd be trading */}
        <div className="flex gap-2 mb-4">
          {(["YES", "NO"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className="flex-1 py-3 rounded-xl font-bold text-sm tap-scale"
              style={{
                backgroundColor: side === s
                  ? (s === "YES" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)")
                  : "#1A1D26",
                border: side === s
                  ? (s === "YES" ? "1px solid #22C55E" : "1px solid #EF4444")
                  : "1px solid #252836",
                color: side === s
                  ? (s === "YES" ? "#22C55E" : "#EF4444")
                  : "#94A3B8",
              }}
            >
              {s} {s === "YES"
                ? `${Math.round(market.yes_probability * 100)}¢`
                : `${Math.round((1 - market.yes_probability) * 100)}¢`}
            </button>
          ))}
        </div>

        <button
          onClick={login}
          className="w-full py-3.5 rounded-xl font-semibold text-white tap-scale"
          style={{ backgroundColor: "#3B82F6" }}
        >
          Sign in to Trade
        </button>
      </div>
    );
  }

  return (
    <div
      className="mx-4 rounded-2xl p-4"
      style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
    >
      {/* Balance display */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: "#94A3B8" }}>Your Balance</span>
        <span className="font-mono text-sm font-semibold" style={{ color: "#22C55E" }}>
          {formatUSDT(demoBalance)}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-6 gap-3"
          >
            <CheckCircle2 className="w-14 h-14" style={{ color: "#22C55E" }} />
            <div className="text-center">
              <p className="font-bold text-lg" style={{ color: "#F1F5F9" }}>Trade Placed!</p>
              <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                {sharesReceived.toFixed(2)} {side} shares @ {Math.round(price * 100)}¢
              </p>
              <p className="text-sm font-mono font-semibold mt-1" style={{ color: "#22C55E" }}>
                Potential win: +{formatUSDT(potentialWin)}
              </p>
            </div>
          </motion.div>

        ) : step === "confirm" ? (
          <motion.div key="confirm" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <h4 className="font-semibold mb-3" style={{ color: "#F1F5F9" }}>Confirm Trade</h4>
            <div className="rounded-xl p-3 flex flex-col gap-2.5 mb-4"
                 style={{ backgroundColor: "#1A1D26" }}>
              <Row label="Outcome" value={
                <span style={{ color: side === "YES" ? "#22C55E" : "#EF4444", fontWeight: 700 }}>{side}</span>
              } />
              <Row label="Cost" value={`$${amount.toFixed(2)}`} />
              <Row label="Shares" value={sharesReceived.toFixed(4)} />
              <Row label="Price/share" value={`${Math.round(price * 100)}¢`} />
              <div style={{ height: 1, backgroundColor: "#252836" }} />
              <Row label="Max payout" value={
                <span style={{ color: "#22C55E" }}>+{formatUSDT(potentialWin)}</span>
              } />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("input")}
                className="flex-1 py-3 rounded-xl text-sm font-medium tap-scale"
                style={{ border: "1px solid #252836", color: "#94A3B8" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm tap-scale"
                style={{
                  backgroundColor: side === "YES" ? "#22C55E" : "#EF4444",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  : `Confirm ${side}`}
              </button>
            </div>
          </motion.div>

        ) : (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* YES / NO tabs */}
            <div className="flex gap-2 mb-4">
              {(["YES", "NO"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { haptic.select(); setSide(s); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm tap-scale transition-all"
                  style={{
                    backgroundColor: side === s
                      ? (s === "YES" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)")
                      : "#1A1D26",
                    border: side === s
                      ? (s === "YES" ? "1px solid rgba(34,197,94,0.6)" : "1px solid rgba(239,68,68,0.6)")
                      : "1px solid #252836",
                    color: side === s
                      ? (s === "YES" ? "#22C55E" : "#EF4444")
                      : "#475569",
                  }}
                >
                  {s === "YES" ? <TrendingUp className="w-3.5 h-3.5 inline mr-1" /> : <TrendingDown className="w-3.5 h-3.5 inline mr-1" />}
                  {s} {s === "YES"
                    ? `${Math.round(market.yes_probability * 100)}¢`
                    : `${Math.round((1 - market.yes_probability) * 100)}¢`}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <form onSubmit={handleSubmit(() => setStep("confirm"))}>
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono"
                      style={{ color: "#94A3B8" }}>$</span>
                <input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  placeholder="0"
                  className="w-full rounded-xl pl-7 pr-16 py-3 font-mono text-lg font-semibold outline-none"
                  style={{
                    backgroundColor: "#1A1D26",
                    border: "1px solid #252836",
                    color: "#F1F5F9",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setValue("amount", Math.floor(demoBalance))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-lg tap-scale"
                  style={{ backgroundColor: "rgba(59,130,246,0.15)", color: "#3B82F6" }}
                >
                  MAX
                </button>
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2 mb-3">
                {[10, 25, 50, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue("amount", v)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium tap-scale"
                    style={{ backgroundColor: "#1A1D26", border: "1px solid #252836", color: "#94A3B8" }}
                  >
                    ${v}
                  </button>
                ))}
              </div>

              {errors.amount && (
                <p className="text-xs mb-2" style={{ color: "#EF4444" }}>{errors.amount.message}</p>
              )}

              {/* Payout preview */}
              {amount >= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl p-3 mb-3"
                  style={{ backgroundColor: "#1A1D26" }}
                >
                  <Row label="Shares received" value={sharesReceived.toFixed(2)} />
                  <Row
                    label="Max profit"
                    value={<span style={{ color: "#22C55E", fontWeight: 600 }}>+{formatUSDT(potentialWin)}</span>}
                  />
                  {slippage > 2 && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs"
                         style={{ color: "#F59E0B" }}>
                      <AlertTriangle className="w-3 h-3" />
                      High impact: {slippage.toFixed(1)}% of pool
                    </div>
                  )}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-white text-base tap-scale flex items-center justify-center gap-2"
                style={{
                  backgroundColor: side === "YES" ? "#22C55E" : "#EF4444",
                  boxShadow: side === "YES"
                    ? "0 0 20px rgba(34,197,94,0.3)"
                    : "0 0 20px rgba(239,68,68,0.3)",
                }}
              >
                <Zap className="w-4 h-4" />
                Buy {side} — {amount >= 1 ? formatUSDT(amount) : "$0"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs" style={{ color: "#94A3B8" }}>{label}</span>
      <span className="text-xs font-mono" style={{ color: "#F1F5F9" }}>{value}</span>
    </div>
  );
}
