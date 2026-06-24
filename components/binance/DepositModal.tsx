"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2, Loader2 } from "lucide-react";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { useTelegram } from "@/hooks/useTelegram";
import { cn } from "@/lib/utils";

const DEMO_ADDRESS = "TRx1234567890ABCDEF1234567890abcdef12";

export function DepositModal() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const { getAccessToken } = usePrivy();
  const { haptic } = useTelegram();

  const fetchAddress = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/binance/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAddress(data.address ?? DEMO_ADDRESS);
    } catch {
      setAddress(DEMO_ADDRESS);
    } finally {
      setLoading(false);
    }
  };

  const displayAddress = address ?? DEMO_ADDRESS;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddress);
    haptic.notify("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-5 mx-4">
      <h3 className="font-semibold text-text-primary mb-1">Deposit USDT</h3>
      <p className="text-xs text-text-secondary mb-4">
        Send USDT (TRC-20) to this address. Min deposit: $1 USDT.
      </p>

      {/* QR Code */}
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-white rounded-2xl">
          <QRCodeSVG value={displayAddress} size={160} level="M" />
        </div>
      </div>

      {/* Address */}
      <div className="bg-bg-elevated border border-border rounded-xl p-3 flex items-center gap-2 mb-3">
        <span className="font-mono text-xs text-text-secondary flex-1 break-all">{displayAddress}</span>
        <button
          onClick={handleCopy}
          className={cn("shrink-0 tap-scale", copied ? "text-accent-green" : "text-text-dim")}
        >
          {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      {!address && (
        <button
          onClick={fetchAddress}
          disabled={loading}
          className="w-full bg-accent-blue text-white font-medium py-3 rounded-xl text-sm tap-scale disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Generate Deposit Address"}
        </button>
      )}

      <p className="text-xs text-text-dim text-center mt-3">
        Network: TRC-20 (Tron) — Only send USDT
      </p>
    </div>
  );
}
