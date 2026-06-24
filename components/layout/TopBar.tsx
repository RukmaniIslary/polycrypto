"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
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
    <header
      className="sticky top-0 z-30 backdrop-blur-md"
      style={{ backgroundColor: "rgba(10,11,15,0.95)", borderBottom: "1px solid #1A1D26" }}
    >
      <div className="flex items-center justify-between px-4 h-12">
        {/* Logo — just the P mark like Polymarket */}
        <Link href="/markets" className="flex items-center">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#3B82F6,#8B5CF6)" }}
          >
            <Image src="/logo.svg" alt="PolyCrypto" width={20} height={20} />
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {authenticated ? (
            <>
              {/* Balance */}
              <Link
                href="/deposit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full tap-scale"
                style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
              >
                <span className="font-mono text-xs font-semibold" style={{ color: "#22C55E" }}>
                  {formatUSDT(balance)}
                </span>
              </Link>

              {/* Bell */}
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center tap-scale"
                style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
              >
                <Bell className="w-4 h-4" style={{ color: "#94A3B8" }} />
              </button>

              {/* Avatar */}
              <Link href="/profile">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    style={{ width: 32, height: 32, border: "2px solid #252836" }}
                    unoptimized
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "#1A1D26", border: "2px solid #252836", color: "#3B82F6" }}
                  >
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <button
              onClick={login}
              className="text-sm font-medium px-4 py-1.5 rounded-full tap-scale"
              style={{ backgroundColor: "#12141A", border: "1px solid #3B82F6", color: "#3B82F6" }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
