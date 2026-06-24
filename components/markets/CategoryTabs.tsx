"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { MarketCategory } from "@/types";
import { cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/useTelegram";

const CATEGORIES: MarketCategory[] = ["All", "FIFA 2026", "Crypto", "DeFi", "Layer2", "Macro", "Featured"];

// Real images for each tab
const TAB_IMAGE: Partial<Record<MarketCategory, { src: string; isFlag?: boolean }>> = {
  "FIFA 2026": { src: "https://flagcdn.com/w40/un.png", isFlag: true },
  Crypto:      { src: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  DeFi:        { src: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  Layer2:      { src: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg" },
  Macro:       { src: "https://flagcdn.com/w40/us.png", isFlag: true },
};

interface CategoryTabsProps {
  active: MarketCategory;
  onChange: (cat: MarketCategory) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const { haptic } = useTelegram();

  return (
    <div className="flex overflow-x-auto gap-2 px-4 py-2 no-scrollbar">
      {CATEGORIES.map((cat) => {
        const img = TAB_IMAGE[cat];
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => { haptic.select(); onChange(cat); }}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all tap-scale shrink-0",
              isActive ? "text-white" : "text-[#94A3B8]"
            )}
            style={!isActive ? { backgroundColor: "#12141A", border: "1px solid #252836" } : {}}
          >
            {/* Animated active pill */}
            {isActive && (
              <motion.div
                layoutId="cat-pill"
                className={cn(
                  "absolute inset-0 rounded-full",
                  cat === "FIFA 2026" ? "bg-green-600" : "bg-[#3B82F6]"
                )}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            {/* Icon */}
            <span className="relative z-10 flex items-center gap-1.5">
              {img ? (
                <Image
                  src={img.src}
                  alt={cat}
                  width={img.isFlag ? 20 : 14}
                  height={img.isFlag ? 14 : 14}
                  className={cn("object-cover shrink-0", img.isFlag ? "rounded-sm" : "rounded-full")}
                  unoptimized
                />
              ) : (
                <span className="text-[11px]">
                  {cat === "All" ? "🌐" : cat === "Featured" ? "⭐" : ""}
                </span>
              )}
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}
