/**
 * Seed script — run with: npx ts-node scripts/seed.ts
 * Or add to package.json: "seed": "ts-node scripts/seed.ts"
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const seedMarkets = [
  {
    question: "Will Bitcoin exceed $110,000 by end of Q3 2026?",
    category: "Crypto",
    yes_probability: 0.68,
    volume_usdt: 4200000,
    liquidity_usdt: 840000,
    trader_count: 3821,
    closes_at: "2026-09-30T23:59:59Z",
    resolution_source: "https://coinmarketcap.com/currencies/bitcoin/",
  },
  {
    question: "Will Ethereum ETF daily volume surpass Bitcoin ETF by August 2026?",
    category: "DeFi",
    yes_probability: 0.31,
    volume_usdt: 1800000,
    liquidity_usdt: 360000,
    trader_count: 1204,
    closes_at: "2026-08-31T23:59:59Z",
    resolution_source: "https://etf.com",
  },
  {
    question: "Will a new Layer-2 token enter top 20 CMC before July 2026?",
    category: "Layer2",
    yes_probability: 0.54,
    volume_usdt: 920000,
    liquidity_usdt: 184000,
    trader_count: 876,
    closes_at: "2026-07-31T23:59:59Z",
    resolution_source: "https://coinmarketcap.com",
  },
  {
    question: "Will the Fed cut interest rates before September 2026?",
    category: "Macro",
    yes_probability: 0.77,
    volume_usdt: 6100000,
    liquidity_usdt: 1220000,
    trader_count: 5102,
    closes_at: "2026-09-01T00:00:00Z",
    resolution_source: "https://federalreserve.gov",
  },
  {
    question: "Will Solana flip Ethereum in daily DEX volume by 2026 year-end?",
    category: "DeFi",
    yes_probability: 0.42,
    volume_usdt: 2300000,
    liquidity_usdt: 460000,
    trader_count: 2187,
    closes_at: "2026-12-31T23:59:59Z",
    resolution_source: "https://defillama.com",
  },
  {
    question: "Will BNB Chain process 10M daily transactions by October 2026?",
    category: "Crypto",
    yes_probability: 0.59,
    volume_usdt: 780000,
    liquidity_usdt: 156000,
    trader_count: 643,
    closes_at: "2026-10-31T23:59:59Z",
    resolution_source: "https://bscscan.com",
  },
  {
    question: "Will Arbitrum TVL exceed $10B by Q4 2026?",
    category: "Layer2",
    yes_probability: 0.47,
    volume_usdt: 1100000,
    liquidity_usdt: 220000,
    trader_count: 921,
    closes_at: "2026-12-31T23:59:59Z",
    resolution_source: "https://defillama.com/chain/Arbitrum",
  },
  {
    question: "Will a spot XRP ETF be approved in the US by December 2026?",
    category: "Crypto",
    yes_probability: 0.71,
    volume_usdt: 3400000,
    liquidity_usdt: 680000,
    trader_count: 2998,
    closes_at: "2026-12-31T23:59:59Z",
    resolution_source: "https://sec.gov",
  },
];

async function seed() {
  console.log("Seeding markets...");
  const { data, error } = await supabase.from("markets").insert(seedMarkets).select();
  if (error) {
    console.error("Error seeding:", error.message);
    process.exit(1);
  }
  console.log(`Seeded ${data.length} markets.`);
}

seed();
