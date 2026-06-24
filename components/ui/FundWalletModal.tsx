"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCircle2, ChevronRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { useTelegram } from "@/hooks/useTelegram";

interface Chain {
  id: string;
  name: string;
  token: string;
  network: string;
  icon: string;
  color: string;
  address: string;
}

const CHAINS: Chain[] = [
  {
    id: "tron",
    name: "Tron",
    token: "USDT",
    network: "TRC-20",
    icon: "🔴",
    color: "#EF4444",
    address: "TRx1234567890ABCDEF1234567890abcdef12",
  },
  {
    id: "polygon",
    name: "Polygon",
    token: "USDC",
    network: "Polygon",
    icon: "🟣",
    color: "#8B5CF6",
    address: "0x1234567890abcdef1234567890ABCDEF12345678",
  },
  {
    id: "bsc",
    name: "BNB Chain",
    token: "USDT",
    network: "BEP-20",
    icon: "🟡",
    color: "#F59E0B",
    address: "0xabcdef1234567890abcdef1234567890ABCDEF12",
  },
  {
    id: "solana",
    name: "Solana",
    token: "USDC",
    network: "SPL",
    icon: "🟢",
    color: "#22C55E",
    address: "So1ana1234567890abcdefABCDEF1234567890abc",
  },
];

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const [selected, setSelected] = useState<Chain | null>(null);
  const [copied, setCopied] = useState(false);
  const { haptic } = useTelegram();
  const { user } = usePrivy();

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    haptic.notify("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSelected(null);
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{ backgroundColor: "#12141A", border: "1px solid #252836", maxHeight: "90vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#252836" }} />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 20px)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "#F1F5F9" }}>
                    {selected ? `Deposit ${selected.token}` : "Fund wallet"}
                  </h2>
                  {!selected && (
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                      Send crypto on any chain
                    </p>
                  )}
                </div>
                <button
                  onClick={selected ? () => setSelected(null) : handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full tap-scale"
                  style={{ backgroundColor: "#1A1D26" }}
                >
                  <X className="w-4 h-4" style={{ color: "#94A3B8" }} />
                </button>
              </div>

              {!selected ? (
                /* Chain list */
                <div className="px-4 pb-8 flex flex-col gap-2">
                  {CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => { haptic.impact("light"); setSelected(chain); }}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl tap-scale text-left"
                      style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: `${chain.color}20` }}
                      >
                        {chain.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "#F1F5F9" }}>
                          Send {chain.token}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                          {chain.name} · {chain.network}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#475569" }} />
                    </button>
                  ))}

                  {/* Apple Pay coming soon */}
                  <div
                    className="w-full flex items-center gap-3 p-4 rounded-2xl opacity-50"
                    style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}
                    >
                      🍎
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: "#F1F5F9" }}>
                        Apple Pay
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                        Card, Apple Pay & Google Pay — Coming soon
                      </div>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: "#252836", color: "#94A3B8" }}
                    >
                      Soon
                    </span>
                  </div>

                  {/* Security note */}
                  <p className="text-center text-xs mt-2" style={{ color: "#475569" }}>
                    🔒 Funds are non-custodial, secured by Privy
                  </p>
                </div>
              ) : (
                /* Address view */
                <div className="px-4 pb-8 flex flex-col items-center gap-4">
                  {/* Chain badge */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${selected.color}20`, border: `1px solid ${selected.color}40` }}
                  >
                    <span>{selected.icon}</span>
                    <span className="text-xs font-semibold" style={{ color: selected.color }}>
                      {selected.network} · {selected.name}
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="p-4 bg-white rounded-2xl">
                    <QRCodeSVG value={selected.address} size={180} level="M" />
                  </div>

                  {/* Address */}
                  <div
                    className="w-full rounded-2xl p-4 flex items-center gap-3"
                    style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}
                  >
                    <span
                      className="font-mono text-xs flex-1 break-all"
                      style={{ color: "#94A3B8" }}
                    >
                      {selected.address}
                    </span>
                    <button
                      onClick={() => handleCopy(selected.address)}
                      className="shrink-0 tap-scale"
                    >
                      {copied
                        ? <CheckCircle2 className="w-5 h-5" style={{ color: "#22C55E" }} />
                        : <Copy className="w-5 h-5" style={{ color: "#3B82F6" }} />
                      }
                    </button>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(selected.address)}
                    className="w-full py-4 rounded-2xl font-bold text-white tap-scale"
                    style={{ backgroundColor: "#3B82F6" }}
                  >
                    {copied ? "Copied!" : `Copy ${selected.token} Address`}
                  </button>

                  <p className="text-xs text-center" style={{ color: "#475569" }}>
                    Only send {selected.token} on {selected.network}. Other assets may be lost.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
