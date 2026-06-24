"use client";

import { useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  showTopBar?: boolean;
  showBottomNav?: boolean;
  className?: string;
}

export function PageWrapper({
  children,
  showTopBar = true,
  showBottomNav = true,
  className,
}: PageWrapperProps) {
  const { tg } = useTelegram();

  useEffect(() => {
    if (!tg) return;
    // Sync Telegram theme with CSS vars
    const params = tg.themeParams;
    if (params?.bg_color) {
      document.documentElement.style.setProperty("--tg-bg", params.bg_color);
    }
  }, [tg]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col max-w-app mx-auto">
      {showTopBar && <TopBar />}
      <main
        className={cn(
          "flex-1",
          showBottomNav && "pb-24",
          className
        )}
      >
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
