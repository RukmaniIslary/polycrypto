"use client";

import { useEffect, useState } from "react";
import { getTelegramWebApp, type TelegramWebApp } from "@/lib/telegram";
import type { TelegramUser } from "@/types";

export function useTelegram() {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      setTg(webApp);
      webApp.ready();
      webApp.expand();
    }
  }, []);

  const user: TelegramUser | undefined = tg?.initDataUnsafe?.user;

  return {
    tg,
    user,
    initData: tg?.initData ?? "",
    theme: tg?.colorScheme ?? "dark",
    isExpanded: tg?.isExpanded ?? false,
    haptic: {
      impact: (style: "light" | "medium" | "heavy" = "medium") => {
        tg?.HapticFeedback.impactOccurred(style);
      },
      notify: (type: "success" | "error" | "warning") => {
        tg?.HapticFeedback.notificationOccurred(type);
      },
      select: () => {
        tg?.HapticFeedback.selectionChanged();
      },
    },
    showPopup: (params: Parameters<TelegramWebApp["showPopup"]>[0], cb?: (id: string) => void) => {
      tg?.showPopup(params, cb);
    },
    close: () => tg?.close(),
    expand: () => tg?.expand(),
    backButton: tg?.BackButton,
    mainButton: tg?.MainButton,
  };
}
