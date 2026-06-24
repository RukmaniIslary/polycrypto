"use client";

import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoginGateProps {
  children: React.ReactNode;
}

export function LoginGate({ children }: LoginGateProps) {
  const { ready, authenticated, login } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center gap-6 w-full max-w-xs"
        >
          <Image src="/logo.svg" alt="PolyCrypto" width={72} height={72} />

          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary mb-2">PolyCrypto</h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              Predict the Market. Own the Outcome.
              <br />
              Trade crypto outcomes in real-time.
            </p>
          </div>

          {/* Feature list */}
          <div className="w-full flex flex-col gap-2">
            {[
              "Trade crypto prediction markets",
              "Connect via Telegram instantly",
              "Deposit & withdraw via Binance",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2 bg-bg-surface border border-border rounded-xl px-4 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-green shrink-0" />
                <span className="text-sm text-text-secondary">{feat}</span>
              </div>
            ))}
          </div>

          <button
            onClick={login}
            className="w-full bg-accent-blue text-white font-semibold py-4 rounded-2xl text-base tap-scale shadow-lg glow-blue"
          >
            Get Started
          </button>

          <p className="text-xs text-text-dim">
            By continuing, you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
