"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2, ChevronLeft, AlertTriangle, Loader2 } from "lucide-react";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { useTelegram } from "@/hooks/useTelegram";
import { useQueryClient } from "@tanstack/react-query";

// ── Chain definitions ────────────────────────────────────────────────────────
interface Chain {
  id: string;
  name: string;
  icon: string;        // URL to chain logo
  token: string;
  network: string;
  minDeposit: string;
  arrivalTime: string;
  warning: string;
  getAddress: (base: string) => string; // derive address from platform address
}

const CHAINS: Chain[] = [
  {
    id: "solana",
    name: "Solana",
    icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    token: "USDC",
    network: "Solana",
    minDeposit: "$3",
    arrivalTime: "~5–15 min",
    warning: "Only send USDC on Solana. Other tokens may be lost permanently.",
    getAddress: () => process.env.NEXT_PUBLIC_SOLANA_DEPOSIT_ADDRESS ?? "Contact support",
  },
  {
    id: "base",
    name: "Base",
    icon: "https://assets.coingecko.com/asset_platforms/images/131/small/base-network.png",
    token: "USDC",
    network: "Base",
    minDeposit: "$1",
    arrivalTime: "~2–5 min",
    warning: "Only send USDC on Base. Other tokens may be lost permanently.",
    getAddress: (base) => base,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    token: "USDT",
    network: "ERC-20",
    minDeposit: "$10",
    arrivalTime: "~5–20 min",
    warning: "Only send USDT on Ethereum. High gas fees apply.",
    getAddress: (base) => base,
  },
  {
    id: "polygon",
    name: "Polygon",
    icon: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
    token: "USDT",
    network: "Polygon",
    minDeposit: "$1",
    arrivalTime: "~2–5 min",
    warning: "Only send USDT on Polygon. Other tokens may be lost permanently.",
    getAddress: (base) => base,
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    token: "BTC",
    network: "Bitcoin",
    minDeposit: "$5",
    arrivalTime: "~30–60 min",
    warning: "Only send BTC on the Bitcoin network.",
    getAddress: () => process.env.NEXT_PUBLIC_BTC_DEPOSIT_ADDRESS ?? "Contact support",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    icon: "https://assets.coingecko.com/asset_platforms/images/33/small/AO_logomark.png",
    token: "USDT",
    network: "Arbitrum",
    minDeposit: "$1",
    arrivalTime: "~2–5 min",
    warning: "Only send USDT on Arbitrum. Other tokens may be lost permanently.",
    getAddress: (base) => base,
  },
  {
    id: "bnb",
    name: "BNB Chain",
    icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    token: "USDT",
    network: "BEP-20",
    minDeposit: "$1",
    arrivalTime: "~2–5 min",
    warning: "Only send USDT on BNB Chain (BEP-20). Other tokens may be lost permanently.",
    getAddress: (base) => base,
  },
];

const PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS ?? "";

export function DepositModal() {
  const [selected, setSelected] = useState<Chain | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const { getAccessToken } = usePrivy();
  const { haptic } = useTelegram();
  const queryClient = useQueryClient();

  const address = selected ? selected.getAddress(PLATFORM_ADDRESS) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    haptic.notify("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSentFunds = async () => {
    setConfirming(true);
    haptic.impact("medium");
    try {
      const token = await getAccessToken();
      await fetch("/api/deposit/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ chain: selected?.id }),
      });
    } catch {}
    setConfirming(false);
    setDone(true);
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const handleBack = () => {
    setSelected(null);
    setDone(false);
    setCopied(false);
  };

  return (
    <div className="px-4 pb-6">
      <AnimatePresence mode="wait">

        {/* ── Chain list ── */}
        {!selected && (
          <motion.div key="list"
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <p className="text-sm font-semibold mb-3" style={{ color: "#94A3B8" }}>Deposit From</p>
            <div className="flex flex-col gap-1">
              {CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => { haptic.impact("light"); setSelected(chain); }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl tap-scale text-left"
                  style={{ backgroundColor: "#12141A", border: "1px solid #1E2130" }}
                >
                  <img src={chain.icon} alt={chain.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="font-semibold text-base flex-1" style={{ color: "#F1F5F9" }}>
                    {chain.name}
                  </span>
                  <span className="text-xs" style={{ color: "#475569" }}>{chain.token}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Address / QR view ── */}
        {selected && !done && (
          <motion.div key="address"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            className="flex flex-col gap-4">

            {/* Back + chain name */}
            <div className="flex items-center gap-2 -ml-1">
              <button onClick={handleBack} className="tap-scale p-1">
                <ChevronLeft className="w-5 h-5" style={{ color: "#94A3B8" }} />
              </button>
              <img src={selected.icon} alt={selected.name}
                className="w-6 h-6 rounded-full object-cover" />
              <span className="font-bold" style={{ color: "#F1F5F9" }}>{selected.name}</span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-3xl shadow-xl">
                <QRCodeSVG value={address} size={190} level="M" />
              </div>
            </div>

            {/* Address + copy */}
            <div>
              <p className="text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "#475569" }}>
                Deposit Address
              </p>
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 p-4 rounded-2xl tap-scale text-left"
                style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}
              >
                <span className="font-mono text-xs flex-1 break-all leading-relaxed" style={{ color: "#F1F5F9" }}>
                  {address}
                </span>
                {copied
                  ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#22C55E" }} />
                  : <Copy className="w-5 h-5 shrink-0" style={{ color: "#3B82F6" }} />
                }
              </button>
            </div>

            {/* Stats row */}
            <div className="flex gap-2">
              {[
                { label: "Network", value: selected.network, color: "#22C55E" },
                { label: "Min deposit", value: selected.minDeposit, color: "#F1F5F9" },
                { label: "Est. arrival", value: selected.arrivalTime, color: "#F1F5F9" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-0.5 p-2.5 rounded-xl"
                  style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}>
                  <span className="text-[10px]" style={{ color: "#64748B" }}>{label}</span>
                  <span className="text-xs font-semibold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 rounded-xl"
              style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
              <p className="text-xs leading-relaxed" style={{ color: "#F59E0B" }}>
                {selected.warning}
              </p>
            </div>

            {/* I've sent my funds */}
            <button
              onClick={handleSentFunds}
              disabled={confirming}
              className="w-full py-4 rounded-2xl font-bold text-white text-base tap-scale"
              style={{ backgroundColor: "#3B82F6", opacity: confirming ? 0.7 : 1 }}
            >
              {confirming
                ? <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                  </span>
                : "I've sent my funds"
              }
            </button>
          </motion.div>
        )}

        {/* ── Done ── */}
        {done && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 gap-4 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
              ✅
            </div>
            <div>
              <p className="font-bold text-xl mb-1" style={{ color: "#F1F5F9" }}>We're on it!</p>
              <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                Your deposit will be credited within {selected?.arrivalTime ?? "a few minutes"} once confirmed on-chain.
              </p>
            </div>
            <button
              onClick={handleBack}
              className="w-full py-3.5 rounded-2xl font-semibold tap-scale"
              style={{ backgroundColor: "#1A1D26", border: "1px solid #252836", color: "#94A3B8" }}
            >
              Deposit again
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
