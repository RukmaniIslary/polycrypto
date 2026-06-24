"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { useAppStore } from "@/store/useAppStore";
import { useTelegram } from "@/hooks/useTelegram";

const schema = z.object({
  address: z.string().min(20, "Enter a valid USDT address"),
  amount: z.number({ invalid_type_error: "Enter an amount" }).positive().min(1, "Min $1"),
});
type FormValues = z.infer<typeof schema>;

export function WithdrawModal() {
  const [success, setSuccess] = useState(false);
  const { getAccessToken } = usePrivy();
  const user = useAppStore((s) => s.user);
  const { haptic } = useTelegram();
  const addToast = useAppStore((s) => s.addToast);
  const balance = user?.usdt_balance ?? 0;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    haptic.impact("heavy");
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/binance/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Withdrawal failed");
      haptic.notify("success");
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      haptic.notify("error");
      addToast({ message: err instanceof Error ? err.message : "Withdrawal failed", type: "error" });
    }
  };

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5 mx-4">
      <h3 className="font-semibold text-text-primary mb-1">Withdraw USDT</h3>
      <p className="text-xs text-text-secondary mb-4">
        Available: <span className="font-mono text-accent-green">${balance.toFixed(2)}</span>
      </p>

      {success ? (
        <div className="py-6 text-center">
          <p className="text-accent-green font-semibold">Withdrawal Submitted</p>
          <p className="text-sm text-text-secondary mt-1">Funds will arrive within 30 minutes</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-text-secondary mb-1 block">USDT Address (TRC-20)</label>
            <input
              {...register("address")}
              placeholder="TRx..."
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 font-mono text-xs text-text-primary placeholder:text-text-dim outline-none focus:border-accent-blue/50"
            />
            {errors.address && <p className="text-xs text-accent-red mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1 block">Amount (USDT)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-mono text-sm">$</span>
              <input
                {...register("amount", { valueAsNumber: true })}
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-bg-elevated border border-border rounded-xl pl-7 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent-blue/50"
              />
            </div>
            {errors.amount && <p className="text-xs text-accent-red mt-1">{errors.amount.message}</p>}
          </div>

          <div className="flex items-start gap-2 bg-accent-amber/10 border border-accent-amber/20 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
            <p className="text-xs text-accent-amber">Double-check your address. Crypto withdrawals are irreversible.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent-blue text-white font-semibold py-3 rounded-xl text-sm tap-scale disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm Withdrawal"}
          </button>
        </form>
      )}
    </div>
  );
}
