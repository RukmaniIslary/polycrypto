import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSDT(amount: number | null | undefined, decimals = 2): string {
  if (amount == null || isNaN(amount)) return "$0";
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(decimals)}`;
}

export function formatProbability(prob: number): string {
  return `${Math.round(prob * 100)}%`;
}

export function formatPricePerShare(price: number): string {
  return `${Math.round(price * 100)}¢`;
}

export function formatTimeRemaining(closesAt: string | null | undefined): string {
  if (!closesAt) return "—";
  const date = new Date(closesAt);
  if (isNaN(date.getTime())) return "—";
  const now = new Date();
  if (date < now) return "Closed";
  return formatDistanceToNow(date, { addSuffix: false });
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy");
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy HH:mm");
}

export function formatPnL(pnl: number): string {
  const sign = pnl >= 0 ? "+" : "";
  return `${sign}$${Math.abs(pnl).toFixed(2)}`;
}

export function formatPnLPct(pnl: number, invested: number): string {
  if (invested === 0) return "0%";
  const pct = (pnl / invested) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

/** AMM price formula: price_yes = yes_shares / (yes_shares + no_shares) */
export function calcAMMPrice(yesShares: number, noShares: number): number {
  const total = yesShares + noShares;
  if (total === 0) return 0.5;
  return yesShares / total;
}

/** AMM shares received: liquidity * (sqrt(1 + amount/liquidity) - 1) */
export function calcSharesReceived(amountUSDT: number, liquidity: number): number {
  if (liquidity === 0) return 0;
  return liquidity * (Math.sqrt(1 + amountUSDT / liquidity) - 1);
}

export function calcPotentialWinnings(shares: number, pricePaid: number): number {
  // Each winning share pays $1, so profit = shares - total_cost
  return shares - pricePaid;
}

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    Crypto: "bg-accent-blue/20 text-accent-blue",
    DeFi: "bg-accent-purple/20 text-accent-purple",
    Layer2: "bg-accent-amber/20 text-accent-amber",
    Macro: "bg-accent-green/20 text-accent-green",
    Featured: "bg-accent-purple/20 text-accent-purple",
    "FIFA 2026": "bg-green-500/20 text-green-400",
  };
  return map[category] ?? "bg-text-dim/20 text-text-secondary";
}
