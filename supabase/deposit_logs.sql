-- Run this in Supabase SQL editor
CREATE TABLE IF NOT EXISTS deposit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tx_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  memo TEXT,
  credited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deposit_logs_tx_id_idx ON deposit_logs(tx_id);
CREATE INDEX IF NOT EXISTS deposit_logs_user_id_idx ON deposit_logs(user_id);
