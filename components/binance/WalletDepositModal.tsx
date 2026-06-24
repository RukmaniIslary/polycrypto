"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, AlertCircle, Wallet, ChevronRight, ExternalLink } from "lucide-react";
import {
  useConnect, useDisconnect, useAccount, useWriteContract,
  useWaitForTransactionReceipt, useReadContract, useSwitchChain,
} from "wagmi";
import { polygon, bsc, mainnet } from "wagmi/chains";
import { parseUnits, formatUnits } from "viem";
import { wagmiConfig, USDT_CONTRACTS, PLATFORM_ADDRESS, ERC20_ABI } from "@/lib/wagmi-config";
import { usePrivySafe } from "@/lib/privy-safe";
import { useTelegram } from "@/hooks/useTelegram";

const CHAINS = [
  { chain: polygon,  label: "Polygon",   symbol: "MATIC", icon: "🟣", color: "#8B5CF6" },
  { chain: bsc,      label: "BNB Chain", symbol: "BNB",   icon: "🟡", color: "#F59E0B" },
  { chain: mainnet,  label: "Ethereum",  label2: "slow + high fees", icon: "🔵", color: "#3B82F6" },
];

const AMOUNTS = [10, 25, 50, 100, 250];

interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount: number, txHash: string) => void;
}

export function WalletDepositModal({ isOpen, onClose, onSuccess }: WalletDepositModalProps) {
  const [step, setStep] = useState<"connect" | "amount" | "confirm" | "pending" | "done">("connect");
  const [selectedChainId, setSelectedChainId] = useState(polygon.id);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { getAccessToken } = usePrivySafe();
  const { haptic } = useTelegram();

  const usdtAddress = USDT_CONTRACTS[selectedChainId];

  // Read user's USDT balance
  const { data: usdtBalance } = useReadContract({
    address: usdtAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: decimals } = useReadContract({
    address: usdtAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: !!address },
  });

  const balanceFormatted = usdtBalance && decimals
    ? parseFloat(formatUnits(usdtBalance, decimals)).toFixed(2)
    : "—";

  // Write contract (USDT transfer)
  const { writeContract, isPending: isSending, error: writeError } = useWriteContract();

  // Wait for tx confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  // When connected, move to amount step
  useEffect(() => {
    if (isConnected && step === "connect") setStep("amount");
  }, [isConnected]);

  // When confirmed, credit balance and move to done
  useEffect(() => {
    if (isConfirmed && txHash) {
      haptic.notify("success");
      setStep("done");
      creditBalance(parseFloat(amount), txHash);
      onSuccess?.(parseFloat(amount), txHash);
    }
  }, [isConfirmed]);

  const creditBalance = async (amt: number, hash: string) => {
    try {
      const token = await getAccessToken();
      await fetch("/api/deposit/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, txHash: hash, chainId: selectedChainId }),
      });
    } catch {}
  };

  const handleSend = async () => {
    if (!address || !amount || !PLATFORM_ADDRESS) return;

    // Switch chain if needed
    if (chain?.id !== selectedChainId) {
      switchChain({ chainId: selectedChainId });
      return;
    }

    const dec = decimals ?? 6;
    const value = parseUnits(amount, dec);

    haptic.impact("medium");
    setStep("pending");

    writeContract(
      {
        address: usdtAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [PLATFORM_ADDRESS, value],
      },
      {
        onSuccess: (hash) => { setTxHash(hash); },
        onError: () => { setStep("confirm"); haptic.notify("error"); },
      }
    );
  };

  const handleClose = () => {
    setStep(isConnected ? "amount" : "connect");
    setAmount("");
    setTxHash(undefined);
    onClose();
  };

  const wrongChain = isConnected && chain?.id !== selectedChainId;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{ backgroundColor: "#12141A", border: "1px solid #252836", maxHeight: "92vh", overflowY: "auto" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#252836" }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-2 pb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "#F1F5F9" }}>Deposit USDT</h2>
                {isConnected && address && (
                  <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                    {address.slice(0, 6)}…{address.slice(-4)}
                    <button onClick={() => { disconnect(); setStep("connect"); }}
                      className="ml-2 underline" style={{ color: "#EF4444" }}>
                      Disconnect
                    </button>
                  </p>
                )}
              </div>
              <button onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "#1A1D26" }}>
                <X className="w-4 h-4" style={{ color: "#94A3B8" }} />
              </button>
            </div>

            <div className="px-4 pb-10">

              {/* STEP: Connect wallet */}
              {step === "connect" && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-center mb-2" style={{ color: "#94A3B8" }}>
                    Connect your wallet to deposit USDT
                  </p>
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => { haptic.impact("light"); connect({ connector }); }}
                      disabled={isConnecting}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl tap-scale"
                      style={{ backgroundColor: "#1A1D26", border: "1px solid #252836" }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: "#252836" }}>
                        <Wallet className="w-5 h-5" style={{ color: "#3B82F6" }} />
                      </div>
                      <span className="font-semibold text-sm flex-1 text-left" style={{ color: "#F1F5F9" }}>
                        {connector.name}
                      </span>
                      {isConnecting
                        ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#94A3B8" }} />
                        : <ChevronRight className="w-4 h-4" style={{ color: "#475569" }} />
                      }
                    </button>
                  ))}
                  <p className="text-center text-xs mt-2" style={{ color: "#475569" }}>
                    🔒 We never store your private keys
                  </p>
                </div>
              )}

              {/* STEP: Select chain + amount */}
              {(step === "amount" || step === "confirm") && (
                <div className="flex flex-col gap-4">

                  {/* Chain selector */}
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "#64748B" }}>Network</p>
                    <div className="flex gap-2">
                      {CHAINS.map(({ chain: c, label, icon, color }) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedChainId(c.id)}
                          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl tap-scale transition-all"
                          style={{
                            backgroundColor: selectedChainId === c.id ? `${color}18` : "#1A1D26",
                            border: selectedChainId === c.id ? `1.5px solid ${color}` : "1.5px solid #252836",
                          }}
                        >
                          <span className="text-xl">{icon}</span>
                          <span className="text-[10px] font-semibold" style={{
                            color: selectedChainId === c.id ? color : "#94A3B8"
                          }}>{label}</span>
                        </button>
                      ))}
                    </div>
                    {wrongChain && (
                      <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl text-xs"
                        style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Wrong network — tap Send to switch automatically
                      </div>
                    )}
                  </div>

                  {/* USDT Balance */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs" style={{ color: "#64748B" }}>Your USDT balance</span>
                    <span className="text-xs font-mono font-semibold" style={{ color: "#22C55E" }}>
                      ${balanceFormatted}
                    </span>
                  </div>

                  {/* Amount input */}
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "#64748B" }}>Amount (USDT)</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg"
                        style={{ color: "#64748B" }}>$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        className="w-full rounded-2xl pl-8 pr-4 py-4 font-mono text-2xl font-bold outline-none"
                        style={{ backgroundColor: "#1A1D26", border: "1.5px solid #252836", color: "#F1F5F9" }}
                      />
                    </div>
                  </div>

                  {/* Quick amounts */}
                  <div className="flex gap-2">
                    {AMOUNTS.map((v) => (
                      <button key={v} onClick={() => setAmount(String(v))}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold tap-scale"
                        style={{
                          backgroundColor: amount === String(v) ? "rgba(59,130,246,0.15)" : "#1A1D26",
                          border: amount === String(v) ? "1px solid #3B82F6" : "1px solid #252836",
                          color: amount === String(v) ? "#3B82F6" : "#94A3B8",
                        }}>
                        ${v}
                      </button>
                    ))}
                  </div>

                  {writeError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-xs"
                      style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {writeError.message.slice(0, 100)}
                    </div>
                  )}

                  {/* Send button */}
                  <button
                    onClick={handleSend}
                    disabled={!amount || parseFloat(amount) < 1 || isSending}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base tap-scale"
                    style={{
                      backgroundColor: !amount || parseFloat(amount) < 1 ? "#1A1D26" : "#3B82F6",
                      opacity: isSending ? 0.7 : 1,
                    }}
                  >
                    {wrongChain
                      ? "Switch Network & Send"
                      : isSending
                        ? <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Waiting for wallet…
                          </span>
                        : `Deposit $${amount || "0"} USDT`
                    }
                  </button>

                  <p className="text-center text-xs" style={{ color: "#475569" }}>
                    Min $1 · Funds appear within 1–2 minutes after confirmation
                  </p>
                </div>
              )}

              {/* STEP: Pending */}
              {step === "pending" && (
                <div className="flex flex-col items-center py-10 gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(59,130,246,0.1)" }}>
                      <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#3B82F6" }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg mb-1" style={{ color: "#F1F5F9" }}>
                      {isConfirming ? "Confirming…" : "Transaction sent"}
                    </p>
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      {isConfirming
                        ? "Waiting for blockchain confirmation"
                        : "Open your wallet to approve the transaction"}
                    </p>
                  </div>
                  {txHash && (
                    <a
                      href={`https://polygonscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs tap-scale"
                      style={{ color: "#3B82F6" }}
                    >
                      View on explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* STEP: Done */}
              {step === "done" && (
                <div className="flex flex-col items-center py-10 gap-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                    <CheckCircle2 className="w-10 h-10" style={{ color: "#22C55E" }} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl mb-1" style={{ color: "#F1F5F9" }}>
                      ${amount} deposited!
                    </p>
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      Your balance will update shortly
                    </p>
                  </div>
                  {txHash && (
                    <a
                      href={`https://polygonscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "#3B82F6" }}
                    >
                      View transaction <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={handleClose}
                    className="w-full py-4 rounded-2xl font-bold text-white tap-scale mt-2"
                    style={{ backgroundColor: "#22C55E" }}
                  >
                    Done
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
