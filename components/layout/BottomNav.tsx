"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Wallet, Zap, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/useTelegram";

const tabs = [
  { icon: TrendingUp, label: "Markets", href: "/markets" },
  { icon: Wallet, label: "Portfolio", href: "/portfolio" },
  { icon: Zap, label: "Trade", href: "/markets", special: true },
  { icon: Trophy, label: "Leaders", href: "/leaderboard" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { haptic } = useTelegram();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app border-t pb-safe z-40" style={{ backgroundColor: "#12141A", borderColor: "#252836" }}>
      <div className="flex items-end justify-around px-2 pt-2">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href) && !tab.special
            ? tab.href !== "/markets" || pathname === "/markets" || pathname.startsWith("/markets/")
            : false;
          const Icon = tab.icon;

          if (tab.special) {
            return (
              <Link
                key={tab.href + tab.label}
                href={tab.href}
                onClick={() => haptic.impact("medium")}
                className="flex flex-col items-center -mt-4"
              >
                <div className="w-14 h-14 rounded-full bg-accent-blue flex items-center justify-center shadow-lg glow-blue tap-scale">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] text-text-secondary mt-1">{tab.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href + tab.label}
              href={tab.href}
              onClick={() => haptic.select()}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-[44px] tap-scale",
                isActive ? "text-accent-blue" : "text-text-dim"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
