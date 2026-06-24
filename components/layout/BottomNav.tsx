"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, LayoutGrid, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/useTelegram";

const tabs = [
  { icon: Home,        label: "Home",      href: "/markets" },
  { icon: Users,       label: "Traders",   href: "/leaderboard" },
  { icon: LayoutGrid,  label: "Markets",   href: "/markets?view=all" },
  { icon: Wallet,      label: "Portfolio", href: "/portfolio" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { haptic } = useTelegram();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app pb-safe z-40"
      style={{ backgroundColor: "#0A0B0F", borderTop: "1px solid #252836" }}
    >
      <div className="flex items-center justify-around px-2 pt-1 pb-1">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/markets"
              ? pathname === "/markets" || pathname.startsWith("/markets/")
              : pathname.startsWith(tab.href.split("?")[0]);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => haptic.select()}
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl min-w-[56px] tap-scale"
            >
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? "#F1F5F9" : "#475569" }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#F1F5F9" : "#475569" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
