export interface Market {
  id: string;
  question: string;
  category: MarketCategory;
  yes_probability: number;
  volume_usdt: number;
  liquidity_usdt: number;
  trader_count: number;
  closes_at: string;
  resolves_at?: string;
  resolution_source?: string;
  resolved: boolean;
  outcome?: boolean;
  created_at: string;
  image_url?: string;   // main image shown on card (flag, coin logo, player photo)
  flag_url?: string;    // country flag for FIFA markets
}

export type MarketCategory = "All" | "Crypto" | "DeFi" | "Layer2" | "Macro" | "Featured" | "FIFA 2026" | "Sports";

export interface Order {
  id: string;
  user_id: string;
  market_id: string;
  side: "YES" | "NO";
  shares: number;
  price_per_share: number;
  total_cost_usdt: number;
  status: "filled" | "pending" | "cancelled";
  created_at: string;
}

export interface Position {
  id: string;
  user_id: string;
  market_id: string;
  side: "YES" | "NO";
  shares: number;
  avg_price: number;
  realized_pnl: number;
  market?: Market;
}

export interface User {
  id: string;
  telegram_id?: number;
  username?: string;
  avatar_url?: string;
  usdt_balance: number;
  binance_api_key_enc?: string;
  binance_secret_enc?: string;
  total_volume: number;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  roi_pct: number;
  total_volume: number;
  markets_played: number;
}

export interface PricePoint {
  time: number;
  yes_probability: number;
  volume?: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
}

export interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
}

export interface PlaceOrderPayload {
  market_id: string;
  side: "YES" | "NO";
  amount_usdt: number;
}

export interface PlaceOrderResult {
  order: Order;
  shares_received: number;
  price_per_share: number;
  new_balance: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}
