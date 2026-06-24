"use client";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export interface AuthUser {
  id: string;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  walletAddress?: string;
  email?: string;
}

export interface SafePrivy {
  user: AuthUser | null;
  authenticated: boolean;
  ready: boolean;
  login: () => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  privyAvailable: boolean;
}

/** Maps a Privy user object to our AuthUser shape */
function mapPrivyUser(privyUser: ReturnType<typeof usePrivy>["user"]): AuthUser | null {
  if (!privyUser) return null;

  // Telegram linked account
  const tgAccount = privyUser.linkedAccounts?.find((a) => a.type === "telegram");
  // Email
  const emailAccount = privyUser.linkedAccounts?.find((a) => a.type === "email");
  // Wallet
  const walletAccount = privyUser.linkedAccounts?.find((a) => a.type === "wallet");

  const tg = tgAccount as any;

  return {
    id: privyUser.id,
    telegramId: tg?.telegramUserId ? Number(tg.telegramUserId) : undefined,
    firstName: tg?.firstName ?? privyUser.google?.name?.split(" ")[0],
    lastName: tg?.lastName,
    username: tg?.username ?? (emailAccount as any)?.address?.split("@")[0],
    photoUrl: tg?.photoUrl,
    walletAddress: (walletAccount as any)?.address,
    email: (emailAccount as any)?.address,
  };
}

export function usePrivySafe(): SafePrivy {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();

  return {
    user: mapPrivyUser(user),
    authenticated,
    ready,
    login,
    logout,
    getAccessToken,
    privyAvailable: true,
  };
}
