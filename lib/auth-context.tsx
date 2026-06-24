"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  telegramId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  walletAddress?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  authenticated: boolean;
  ready: boolean;
  login: () => void;
  logout: () => void;
  getToken: () => string | null;
}

const Ctx = createContext<AuthCtx>({
  user: null, authenticated: false, ready: false,
  login: () => {}, logout: () => {}, getToken: () => null,
});

const KEY = "pc_auth_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const saveAndLogin = useCallback((u: AuthUser) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    setShowModal(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  const getToken = useCallback(() => {
    if (!user) return null;
    return btoa(user.id + ":" + Date.now());
  }, [user]);

  useEffect(() => {
    // Try Telegram auto-login
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        const authUser: AuthUser = {
          id: "tg_" + u.id,
          telegramId: u.id,
          firstName: u.first_name,
          lastName: u.last_name,
          username: u.username,
          photoUrl: u.photo_url,
        };
        saveAndLogin(authUser);
        tg.ready?.();
        tg.expand?.();
        setReady(true);
        return;
      }
    } catch {}
    // Try stored session
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { setUser(JSON.parse(raw)); }
    } catch {}
    setReady(true);
  }, [saveAndLogin]);

  const login = useCallback(() => setShowModal(true), []);

  return (
    <Ctx.Provider value={{ user, authenticated: !!user, ready, login, logout, getToken }}>
      {children}
      {showModal && (
        <LoginModal
          onTelegram={() => {
            try {
              const tg = (window as any).Telegram?.WebApp;
              if (tg?.initDataUnsafe?.user) {
                const u = tg.initDataUnsafe.user;
                saveAndLogin({ id: "tg_" + u.id, telegramId: u.id, firstName: u.first_name, username: u.username, photoUrl: u.photo_url });
              } else {
                alert("Please open inside Telegram to sign in with Telegram");
              }
            } catch {}
          }}
          onWallet={async () => {
            try {
              const eth = (window as any).ethereum;
              if (!eth) { alert("Install MetaMask to connect wallet"); return; }
              const [addr] = await eth.request({ method: "eth_requestAccounts" });
              saveAndLogin({ id: "wallet_" + addr, walletAddress: addr, username: addr.slice(0,6) + "..." + addr.slice(-4) });
            } catch {}
          }}
          onGuest={() => {
            saveAndLogin({ id: "guest_" + Date.now(), firstName: "Trader", username: "trader_" + Math.floor(Math.random()*9999) });
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </Ctx.Provider>
  );
}

export function useAuth() { return useContext(Ctx); }

function LoginModal({ onTelegram, onWallet, onGuest, onClose }: {
  onTelegram: () => void; onWallet: () => void; onGuest: () => void; onClose: () => void;
}) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",backgroundColor:"rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div style={{ width:"100%",maxWidth:430,borderRadius:"24px 24px 0 0",padding:24,backgroundColor:"#12141A",border:"1px solid #252836",display:"flex",flexDirection:"column",gap:12 }} onClick={e=>e.stopPropagation()}>
        <div style={{ textAlign:"center",marginBottom:8 }}>
          <div style={{ width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#3B82F6,#8B5CF6)",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:"white" }}>P</div>
          <div style={{ fontSize:18,fontWeight:700,color:"#F1F5F9" }}>Sign in to PolyCrypto</div>
          <div style={{ fontSize:12,color:"#94A3B8",marginTop:4 }}>Predict the Market. Own the Outcome.</div>
        </div>
        <button onClick={onTelegram} style={{ width:"100%",padding:"16px",borderRadius:16,backgroundColor:"#229ED9",color:"white",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.51 14.367l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.638.192z"/></svg>
          Continue with Telegram
        </button>
        <button onClick={onWallet} style={{ width:"100%",padding:"16px",borderRadius:16,backgroundColor:"#1A1D26",color:"#F1F5F9",fontWeight:700,fontSize:15,border:"1px solid #3B82F6",cursor:"pointer" }}>
          Connect MetaMask Wallet
        </button>
        <button onClick={onGuest} style={{ width:"100%",padding:"12px",borderRadius:16,backgroundColor:"transparent",color:"#94A3B8",fontSize:14,border:"none",cursor:"pointer" }}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
