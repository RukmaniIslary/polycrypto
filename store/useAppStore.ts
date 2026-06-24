import { create } from "zustand";
import type { Market, User } from "@/types";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  selectedMarket: Market | null;
  setSelectedMarket: (market: Market | null) => void;

  isTradePanelOpen: boolean;
  setTradePanelOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `toast-${Date.now()}-${Math.random()}` },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  selectedMarket: null,
  setSelectedMarket: (market) => set({ selectedMarket: market }),

  isTradePanelOpen: false,
  setTradePanelOpen: (open) => set({ isTradePanelOpen: open }),
}));
