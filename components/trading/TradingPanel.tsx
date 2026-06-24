"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import { Zap, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { Market } from "@/types";
import { useTrading } from "@/hooks/useTrading";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { useAppStore } from "@/store/useAppStore";
import { useTelegram } from "@/hooks/useTelegram";
import { calcSharesReceived, formatUSDT, cn } from "@/lib/utils";

const schema = z.object({
  amount: z.number({ invalid_type_error: "Enter an amount" }).positive("Amount must be > 0"),
});
type FormValues = z.infer<typeof schema>;

interface TradingPanelProps {
  market: Market;
}

export function TradingPanel({ market }: TradingPanelProps) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [step, setStep] = useState<"input" | "confirm" | "success">("input");

  const { placeOrder, isLoading } = useTrading();
  const { authenticated, login } = usePrivy();
  const { user: appUser } = useAppStore();
  const { haptic, mainButton } = useTelegram();
  const addToast = useAppStore((s) => s.addToast);

  const balance = appUser?.usdt_balance ?? 0;
  const price = side === "YES" ? market.yes_probability : 1 - market.yes_probability;
  const liquidity = market.liquidity_usdt;

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: undefined },
  });

  const amount = watch("amount") || 0;
  const sharesReceived = calcSharesReceived(amount, liquidity);
  const potentialWin = sharesReceived - amount;
  const slippage = liquidity > 0 ? (amount / liquidity) * 100 : 0;

  // Sync Telegram MainButton
  useEffect(() => {
    if (!mainButton || step !== "confirm") return;
    mainButton.setText(`Confirm ${side} Order`);
    mainButton.setParams({ color: "#3B82F6", is_active: true, is_visible: true });
    mainButton.onClick(() => handleConfirm());
    return () => {
      mainButton.hide();
      mainButton.offClick(() => handleConfirm());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainButton, step, side]);

  const handleConfirm = useCallback(async () => {
    if (!amount) return;
    haptic.impact("heavy");
    try {
      await placeOrder({ market_id: market.id, side, amount_usdt: amount });
      haptic.notify("success");
      setStep("success");

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#22C55E", "#3B82F6", "#8B5CF6"],
      });

      setTimeout(() => {
        setStep("input");
        reset();
        mainButton?.hide();
      }, 2500);
    } catch (err: unknown) {
      haptic.notify("error");
      addToast({ message: err instanceof Error ? err.message : "Order failed", type: "error" });
      setStep("input");
      mainButton?.hide();
    }
  }, [amount, placeOrder, market.id, side, haptic, addToast, reset, mainButton]);

  if (!authenticated) {
    return (
      <div className="sticky bottom-20 mx-4 bg-bg-elevated border border-border rounded-2xl p-4 shadow-2xl">
        <p className="text-sm text-text-secondary text-center mb-3">Connect to start trading</p>
        <button
          onClick={login}
          className="w-full bg-accent-blue text-white font-semibold py-3 rounded-xl tap-scale"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="sticky bottom-20 mx-4 bg-bg-elevated border border-border rounded-2xl p-4 shadow-2xl">
      <AnimatePresence mode="wait">
        {step === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-4 gap-2"
          >
            <CheckCircle2 className="w-12 h-12 text-accent-green" />
            <p className="font-semibold text-text-primary">Order Placed!</p>
            <p className="text-sm text-text-secondary">
              {sharesReceived.toFixed(2)} {side} shares acquired
            </p>
          </motion.div>
        ) : step === "confirm" ? (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <h4 className="font-semibold text-text-primary mb-3">Confirm Order</h4>
            <div className="bg-bg-surface rounded-xl p-3 flex flex-col gap-2 text-sm mb-3">
              <Row label="Side" value={
                <span className={side === "YES" ? "text-accent-green font-semibold" : "text-accent-red font-semibold"}>
                  {side}
                </span>
              } />
              <Row label="Amount" value={`$${amount.toFixed(2)}`} />
              <Row label="Price per share" value={`${Math.round(price * 100)}¢`} />
              <Row label="Shares" value={sharesReceived.toFixed(4)} />
              <Row label="Potential win" value={
                <span className="text-accent-green">+{formatUSDT(potentialWin)}</span>
              } />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setStep("input"); mainButton?.hide(); }}
                className="flex-1 py-3 rounded-xl border border-border text-text-secondary font-medium text-sm tap-scale"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-2 flex-1 py-3 rounded-xl bg-accent-blue text-white font-semibold text-sm tap-scale disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Place ${side} Order`}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* YES / NO toggle */}
            <div className="relative flex bg-bg-surface rounded-xl p-0.5 mb-4">
              <motion.div
                layout
                className={cn(
                  "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-[10px] transition-all",
                  side === "YES" ? "left-0.5 bg-yes-gradient border border-accent-green/30" : "left-[calc(50%+1px)] bg-no-gradient border border-accent-red/30"
                )}
              />
              {(["YES", "NO"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { haptic.select(); setSide(s); }}
                  className={cn(
                    "relative flex-1 py-2.5 text-sm font-semibold rounded-[10px] transition-colors z-10",
                    side === s
                      ? s === "YES" ? "text-accent-green" : "text-accent-red"
                      : "text-text-dim"
                  )}
                >
                  {s} {s === "YES" ? `${Math.round(market.yes_probability * 100)}¢` : `${Math.round((1 - market.yes_probability) * 100)}¢`}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <form onSubmit={handleSubmit(() => setStep("confirm"))}>
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-mono text-sm">$</span>
                <input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-bg-surface border border-border rounded-xl pl-7 pr-14 py-3 font-mono text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent-blue/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setValue("amount", Math.floor(balance))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-accent-blue font-semibold"
                >
                  MAX
                </button>
              </div>

              {errors.amount && (
                <p className="text-xs text-accent-red mb-2">{errors.amount.message}</p>
              )}

              {/* Winnings preview */}
              {amount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-bg-surface rounded-xl p-3 mb-3 text-sm"
                >
                  <Row label="Shares received" value={sharesReceived.toFixed(4)} />
                  <Row
                    label="Potential profit"
                    value={<span className="text-accent-green font-semibold">+{formatUSDT(potentialWin)}</span>}
                  />
                  {slippage > 2 && (
                    <div className="flex items-center gap-1.5 mt-2 text-accent-amber text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      High slippage: {slippage.toFixed(1)}% of liquidity
                    </div>
                  )}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm tap-scale transition-all",
                  side === "YES"
                    ? "bg-accent-green text-white hover:bg-green-500"
                    : "bg-accent-red text-white hover:bg-red-500"
                )}
              >
                <Zap className="w-4 h-4" />
                Place Order
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
    <div className="flex items-center justify-between">
      <span className="text-text-secondary text-xs">{label}</span>
      <span className="text-text-primary text-xs font-mono">{value}</span>
    </div>
  );
}
