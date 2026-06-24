"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { DEMO_PRIVY, SafePrivyContext, PrivyAvailableContext, type SafePrivy, type AuthUser } from "@/lib/privy-safe";

const STORAGE_KEY = "polycrypto_auth";

function loadStoredAuth(): SafePrivy | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user: AuthUser = JSON.parse(raw);
    return buildAuth(user, () => {}, async () => null);
  } catch {
    return null;
  }
}

function buildAuth(
  user: AuthUser,
  logoutFn: () => void,
  getTokenFn: () => Promise<string | null>
): SafePrivy {
  return {
    ready: true,
    authenticated: true,
    user,
    login: () => {},
    logout: async () => logoutFn(),
    getAccessToken: getTokenFn,
    privyAvailable: true,
  };
}

export function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<SafePrivy>({ ...DEMO_PRIVY, ready: false });

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ ...DEMO_PRIVY, ready: true });
  }, []);

  const getToken = useCallback(async () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Return a simple JWT-like token from the stored user id
    try {
      const user: AuthUser = JSON.parse(raw);
      return btoa(JSON.stringify({ sub: user.id, exp: Date.now() + 3600000 }));
    } catch {
      return null;
    }
  }, []);

  const loginWithTelegram = useCallback((tgUser: NonNullable<Window["Telegram"]>["WebApp"]["initDataUnsafe"]["user"]) => {
    if (!tgUser) return;
    const user: AuthUser = {
      id: `tg_${tgUser.id}`,
      telegramId: tgUser.id,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setAuth(buildAuth(user, logout, getToken));
  }, [logout, getToken]);

  const openLoginModal = useCallback(() => {
    setAuth((prev) => ({ ...prev, _showModal: true } as SafePrivy));
    // Show the modal — handled by AuthModal component
    const event = new CustomEvent("polycrypto:openAuth");
    window.dispatchEvent(event);
  }, []);

  useEffect(() => {
    // 1. Try Telegram WebApp auto-login first
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      loginWithTelegram(tg.initDataUnsafe.user);
      tg.ready();
      tg.expand();
      return;
    }

    // 2. Try stored session
    const stored = loadStoredAuth();
    if (stored) {
      setAuth({
        ...stored,
        logout: async () => logout(),
        getAccessToken: getToken,
      });
      return;
    }

    // 3. No session — ready but not authenticated
    setAuth({ ...DEMO_PRIVY, ready: true, login: openLoginModal });
  }, [loginWithTelegram, logout, getToken, openLoginModal]);

  const value: SafePrivy = {
    ...auth,
    login: auth.authenticated ? auth.login : openLoginModal,
    logout: async () => logout(),
    getAccessToken: getToken,
  };

  return (
    <SafePrivyContext.Provider value={value}>
      <PrivyAvailableContext.Provider value={value.authenticated}>
        {children}
        <AuthModal onLogin={loginWithTelegram} onClose={() => {}} />
      </PrivyAvailableContext.Provider>
    </SafePrivyContext.Provider>
  );
}

// ── Simple auth modal ──────────────────────────────────────────────────────
interface AuthModalProps {
  onLogin: (user: NonNullable<Window["Telegram"]>["WebApp"]["initDataUnsafe"]["user"]) => void;
  onClose: () => void;
}

function AuthModal({ onLogin, onClose }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("polycrypto:openAuth", handler);
    return () => window.removeEventListener("polycrypto:openAuth", handler);
  }, []);

  if (!open) return null;

  const handleWalletConnect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const address = accounts[0];
        const user: AuthUser = {
          id: `wallet_${address.toLowerCase()}`,
          walletAddress: address,
          username: address.slice(0, 6) + "..." + address.slice(-4),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        onLogin(null as never); // trigger re-auth via stored
        window.location.reload();
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("No wallet found. Install MetaMask or use Telegram.");
    }
  };

  const handleDemoLogin = () => {
    const user: AuthUser = {
      id: `demo_${Date.now()}`,
      firstName: "Trader",
      username: `trader_${Math.floor(Math.random() * 9999)}`,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setOpen(false);
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-app rounded-t-3xl p-6 flex flex-col gap-4"
        style={{ backgroundColor: "#12141A", border: "1px solid #252836" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#3B82F6,#8B5CF6)" }}
          >
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h2 className="text-lg font-bold" style={{ color: "#F1F5F9" }}>Sign in to PolyCrypto</h2>
          <p className="text-xs text-center" style={{ color: "#94A3B8" }}>
            Predict the Market. Own the Outcome.
          </p>
        </div>

        {/* Telegram button */}
        <button
          onClick={() => {
            const tg = window.Telegram?.WebApp;
            if (tg?.initDataUnsafe?.user) {
              onLogin(tg.initDataUnsafe.user);
              setOpen(false);
            } else {
              alert("Open this app inside Telegram to sign in with Telegram.");
            }
          }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-white tap-scale"
          style={{ backgroundColor: "#229ED9" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.51 14.367l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.638.192z"/>
          </svg>
          Continue with Telegram
        </button>

        {/* Wallet button */}
        <button
          onClick={handleWalletConnect}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold tap-scale"
          style={{ backgroundColor: "#1A1D26", border: "1px solid #252836", color: "#F1F5F9" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#3B82F6">
            <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
          </svg>
          Connect Wallet (MetaMask)
        </button>

        {/* Demo button */}
        <button
          onClick={handleDemoLogin}
          className="w-full py-3 rounded-2xl text-sm tap-scale"
          style={{ color: "#94A3B8" }}
        >
          Continue as Guest (Demo)
        </button>

        <p className="text-[10px] text-center" style={{ color: "#475569" }}>
          By continuing you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}

// Extend window type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
  }
}
