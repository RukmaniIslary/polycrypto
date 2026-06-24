"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import { Copy, CheckCircle2, LogOut, Wallet, Link as LinkIcon, Bell } from "lucide-react";
import { useState } from "react";
import { usePrivySafe as usePrivy } from "@/lib/privy-safe";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LoginGate } from "@/components/auth/LoginGate";
import { useAppStore } from "@/store/useAppStore";
import { useTelegram } from "@/hooks/useTelegram";
import { formatUSDT, truncateAddress } from "@/lib/utils";

export default function ProfilePage() {
  const { user: privyUser, logout, authenticated } = usePrivy();
  const { user: tgUser, haptic } = useTelegram();
  const appUser = useAppStore((s) => s.user);
  const [copied, setCopied] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const walletAddress = privyUser?.wallet?.address ?? "";
  const displayName = tgUser?.first_name
    ? `${tgUser.first_name}${tgUser.last_name ? ` ${tgUser.last_name}` : ""}`
    : appUser?.username ?? "Anonymous";
  const username = tgUser?.username ? `@${tgUser.username}` : null;
  const avatarUrl = tgUser?.photo_url ?? appUser?.avatar_url;
  const referralLink = `https://t.me/PolyCryptoBot?start=${privyUser?.id?.slice(0, 8) ?? "ref"}`;

  const handleCopyWallet = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    haptic.notify("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referralLink);
    haptic.notify("success");
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <LoginGate>
      <PageWrapper>
        <div className="flex flex-col gap-4 px-4 pt-4">
          {/* Avatar + name */}
          <div className="flex flex-col items-center py-6 gap-3">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-2 border-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-accent-blue/20 border-2 border-accent-blue/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-accent-blue">{displayName[0]?.toUpperCase()}</span>
              </div>
            )}
            <div className="text-center">
              <div className="font-display text-xl font-700 text-text-primary">{displayName}</div>
              {username && <div className="text-sm text-text-secondary">{username}</div>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Balance", value: formatUSDT(appUser?.usdt_balance ?? 0) },
              { label: "Volume", value: formatUSDT(appUser?.total_volume ?? 0) },
              { label: "Markets", value: "—" },
            ].map((stat) => (
              <div key={stat.label} className="bg-bg-surface border border-border rounded-xl p-3 text-center">
                <div className="font-mono text-sm font-semibold text-text-primary">{stat.value}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Wallet */}
          {walletAddress && (
            <SectionCard>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-text-dim" />
                <span className="text-sm font-medium text-text-secondary">Wallet</span>
              </div>
              <div className="flex items-center justify-between bg-bg-elevated rounded-xl px-3 py-2">
                <span className="font-mono text-xs text-text-secondary">{truncateAddress(walletAddress, 8)}</span>
                <button onClick={handleCopyWallet} className="tap-scale">
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-accent-green" />
                  ) : (
                    <Copy className="w-4 h-4 text-text-dim" />
                  )}
                </button>
              </div>
            </SectionCard>
          )}

          {/* Referral */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4 text-text-dim" />
              <span className="text-sm font-medium text-text-secondary">Referral Link</span>
            </div>
            <div className="flex items-center justify-between bg-bg-elevated rounded-xl px-3 py-2">
              <span className="font-mono text-xs text-text-secondary truncate flex-1 mr-2">{referralLink}</span>
              <button onClick={handleCopyRef} className="tap-scale shrink-0">
                {copiedRef ? (
                  <CheckCircle2 className="w-4 h-4 text-accent-green" />
                ) : (
                  <Copy className="w-4 h-4 text-text-dim" />
                )}
              </button>
            </div>
          </SectionCard>

          {/* Settings */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-text-dim" />
              <span className="text-sm font-medium text-text-secondary">Settings</span>
            </div>
            <SettingsRow label="Notifications" value={
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-bg-elevated peer-checked:bg-accent-blue rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
              </label>
            } />
          </SectionCard>

          {/* Logout */}
          {authenticated && (
            <button
              onClick={() => { haptic.impact("medium"); logout(); }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-accent-red/30 text-accent-red text-sm font-medium tap-scale"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          )}
        </div>
      </PageWrapper>
    </LoginGate>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-4">
      {children}
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-text-primary">{label}</span>
      {value}
    </div>
  );
}
