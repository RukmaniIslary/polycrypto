-- PolyCrypto Database Schema
-- Run this in your Supabase SQL editor

-- Markets
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'Crypto',
  yes_probability DECIMAL(5,4) DEFAULT 0.5,
  volume_usdt DECIMAL(18,2) DEFAULT 0,
  liquidity_usdt DECIMAL(18,2) DEFAULT 10000,
  trader_count INT DEFAULT 0,
  closes_at TIMESTAMPTZ NOT NULL,
  resolves_at TIMESTAMPTZ,
  resolution_source TEXT,
  resolved BOOLEAN DEFAULT false,
  outcome BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  market_id UUID REFERENCES markets(id),
  side VARCHAR(3) CHECK (side IN ('YES','NO')),
  shares DECIMAL(18,4),
  price_per_share DECIMAL(8,6),
  total_cost_usdt DECIMAL(18,2),
  status VARCHAR(20) DEFAULT 'filled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Positions
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  market_id UUID REFERENCES markets(id),
  side VARCHAR(3) CHECK (side IN ('YES','NO')),
  shares DECIMAL(18,4),
  avg_price DECIMAL(8,6),
  realized_pnl DECIMAL(18,2) DEFAULT 0,
  UNIQUE(user_id, market_id, side)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  username TEXT,
  avatar_url TEXT,
  usdt_balance DECIMAL(18,2) DEFAULT 0,
  binance_api_key_enc TEXT,
  binance_secret_enc TEXT,
  total_volume DECIMAL(18,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Markets are readable by anyone
CREATE POLICY "markets_read" ON markets FOR SELECT USING (true);

-- Orders: users can read their own
CREATE POLICY "orders_self_read" ON orders FOR SELECT USING (user_id = auth.uid()::text);

-- Positions: users can read their own
CREATE POLICY "positions_self_read" ON positions FOR SELECT USING (user_id = auth.uid()::text);

-- Users: read own profile
CREATE POLICY "users_self_read" ON users FOR SELECT USING (id = auth.uid()::text);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE markets;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_market ON orders(market_id);
CREATE INDEX IF NOT EXISTS idx_positions_user ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);
CREATE INDEX IF NOT EXISTS idx_markets_volume ON markets(volume_usdt DESC);
