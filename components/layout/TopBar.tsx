"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, ChevronDown } from "lucide-react";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { useTelegram } from "@/hooks/useTelegram";
import { useAppStore } from "@/store/useAppStore";
import { formatUSDT } from "@/lib/utils";

export function TopBar() {
  const { authenticated, login } = usePrivy();
  const { user: tgUser } = useTelegram();
  const appUser = useAppStore((s) => s.user);

  const balance = appUser?.usdt_balance ?? 0;
  const avatarUrl = tgUser?.photo_url ?? appUser?.avatar_url;
  const displayName = tgUser?.first_name ?? appUser?.username ?? "Guest";

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ backgroundColor: "rgba(10,11,15,0.92)", borderColor: "#252836" }}>
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link href="/markets" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="PolyCrypto" width={28} height={28} />
          <span className="font-display font-700 text-base text-text-primary tracking-tight">
            PolyCrypto
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {authenticated ? (
            <>
              {/* Balance pill */}
              <Link href="/deposit" className="flex items-center gap-1.5 bg-bg-surface border border-border rounded-full px-3 py-1.5 tap-scale">
                <span className="font-mono text-xs text-accent-green font-medium">
                  {formatUSDT(balance)}
                </span>
                <ChevronDown className="w-3 h-3 text-text-dim" />
              </Link>

              {/* Bell */}
              <button className="w-8 h-8 rounded-full bg-bg-surface border border-border flex items-center justify-center tap-scale">
                <Bell className="w-4 h-4 text-text-secondary" />
              </button>

              {/* Avatar */}
              <Link href="/profile">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent-blue/20 border border-accent-blue/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-accent-blue">
                      {displayName[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
            </>
          ) : (
            <button
              onClick={login}
              className="bg-accent-blue text-white text-sm font-medium px-4 py-1.5 rounded-full tap-scale"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
