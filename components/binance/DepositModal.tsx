"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { useTelegram } from "@/hooks/useTelegram";
import { useQuery } from "@tanstack/react-query";

interface DepositInfo {
  address: string;
  network: string;
  memo: string;
  coin: string;
  fallback?: boolean;
}

export function DepositModal() {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const { getAccessToken } = usePrivy();
  const { haptic } = useTelegram();

  const { data, isLoading, isError, refetch } = useQuery<DepositInfo>({
    queryKey: ["deposit-address"],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch("/api/binance/deposit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch deposit address");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min — address doesn't change often
  });

  const copy = (text: string, which: "address" | "memo") => {
    navigator.clipboard.writeText(text);
    haptic.notify("success");
    if (which === "address") {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#3B82F6" }} />
        <p className="text-sm" style={{ color: "#94A3B8" }}>Loading deposit address…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <AlertCircle className="w-8 h-8" style={{ color: "#EF4444" }} />
        <p className="text-sm" style={{ color: "#94A3B8" }}>Failed to load address</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm tap-scale"
          style={{ backgroundColor: "#1A1D26", color: "#3B82F6", border: "1px solid #252836" }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Network badge */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          🔴 {data.coin} · {data.network}
        </div>
        <button
          onClick={() => refetch()}
          className="tap-scale"
          style={{ color: "#475569" }}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-2xl shadow-lg">
          <QRCodeSVG value={data.address} size={180} level="M" />
        </div>
      </div>

      {/* Address row */}
      <div>
        <p className="text-xs font-medium mb-1.5" style={{ color: "#64748B" }}>Deposit address</p>
        <button
          onClick={() => copy(data.address, "address")}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl tap-scale text-left"
          style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}
        >
          <span className="font-mono text-xs flex-1 break-all" style={{ color: "#F1F5F9" }}>
            {data.address}
          </span>
          {copiedAddress
            ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#22C55E" }} />
            : <Copy className="w-5 h-5 shrink-0" style={{ color: "#3B82F6" }} />
          }
        </button>
      </div>

      {/* Memo row — important for identifying the user's deposit */}
      <div>
        <p className="text-xs font-medium mb-1.5" style={{ color: "#64748B" }}>
          Your deposit memo{" "}
          <span className="font-normal" style={{ color: "#EF4444" }}>
            (required — must include this)
          </span>
        </p>
        <button
          onClick={() => copy(data.memo, "memo")}
          className="w-full flex items-center gap-3 p-3.5 rounded-2xl tap-scale"
          style={{ backgroundColor: "#1A1D26", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <span className="font-mono text-2xl font-bold flex-1 text-center tracking-[0.3em]" style={{ color: "#F1F5F9" }}>
            {data.memo}
          </span>
          {copiedMemo
            ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#22C55E" }} />
            : <Copy className="w-5 h-5 shrink-0" style={{ color: "#3B82F6" }} />
          }
        </button>
      </div>

      {/* Warning */}
      <div
        className="flex items-start gap-2.5 p-3.5 rounded-2xl text-xs"
        style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
        <div style={{ color: "#F59E0B" }}>
          <strong>You must include your memo</strong> when sending. Without it, your deposit cannot be matched to your account. Min deposit: $1 USDT.
        </div>
      </div>

      {/* Min deposit info */}
      <p className="text-center text-xs" style={{ color: "#475569" }}>
        Only send USDT on TRC-20 (Tron) · Balance updates within 5–10 minutes
      </p>
    </div>
  );
}
