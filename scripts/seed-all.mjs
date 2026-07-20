// Run with: node scripts/seed-all.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local manually
const env = readFileSync(".env.local", "utf-8");
const vars = {};
for (const line of env.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  // Remove surrounding quotes if present
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  vars[key] = val;
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

const FLAG = (code) => `https://flagcdn.com/w80/${code}.png`;
const COINS = {
  bitcoin:  "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  ethereum: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  xrp:      "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  bnb:      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  solana:   "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  arbitrum: "https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg",
};

const markets = [
  { id: "fifa-1",    question: "Will Brazil win the FIFA World Cup 2026?",                               category: "FIFA 2026", yes_probability: 0.22, volume_usdt: 8400000,  liquidity_usdt: 1680000, trader_count: 12441, closes_at: "2026-07-19T22:00:00Z", resolves_at: "2026-07-20T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("br"),     flag_url: FLAG("br") },
  { id: "fifa-4",    question: "Will Argentina win the FIFA World Cup 2026?",                            category: "FIFA 2026", yes_probability: 0.19, volume_usdt: 9100000,  liquidity_usdt: 1820000, trader_count: 13200, closes_at: "2026-07-19T22:00:00Z", resolves_at: "2026-07-20T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("ar"),     flag_url: FLAG("ar") },
  { id: "fifa-2",    question: "Will France win the FIFA World Cup 2026?",                               category: "FIFA 2026", yes_probability: 0.18, volume_usdt: 7200000,  liquidity_usdt: 1440000, trader_count: 10880, closes_at: "2026-07-19T22:00:00Z", resolves_at: "2026-07-20T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("fr"),     flag_url: FLAG("fr") },
  { id: "fifa-5",    question: "Will Spain win the FIFA World Cup 2026?",                                category: "FIFA 2026", yes_probability: 0.16, volume_usdt: 5800000,  liquidity_usdt: 1160000, trader_count: 8720,  closes_at: "2026-07-19T22:00:00Z", resolves_at: "2026-07-20T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("es"),     flag_url: FLAG("es") },
  { id: "fifa-3",    question: "Will England win the FIFA World Cup 2026?",                              category: "FIFA 2026", yes_probability: 0.14, volume_usdt: 6100000,  liquidity_usdt: 1220000, trader_count: 9310,  closes_at: "2026-07-19T22:00:00Z", resolves_at: "2026-07-20T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("gb-eng"), flag_url: FLAG("gb-eng") },
  { id: "fifa-6",    question: "Will Germany win the FIFA World Cup 2026?",                              category: "FIFA 2026", yes_probability: 0.11, volume_usdt: 4300000,  liquidity_usdt: 860000,  trader_count: 6540,  closes_at: "2026-07-19T22:00:00Z", resolves_at: "2026-07-20T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("de"),     flag_url: FLAG("de") },
  { id: "fifa-pt",   question: "Will Portugal reach the World Cup 2026 semifinals?",                     category: "FIFA 2026", yes_probability: 0.39, volume_usdt: 3100000,  liquidity_usdt: 620000,  trader_count: 5540,  closes_at: "2026-07-14T22:00:00Z", resolves_at: "2026-07-15T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("pt"),     flag_url: FLAG("pt") },
  { id: "fifa-9",    question: "Will the USA reach the World Cup 2026 quarterfinals?",                   category: "FIFA 2026", yes_probability: 0.48, volume_usdt: 4700000,  liquidity_usdt: 940000,  trader_count: 7630,  closes_at: "2026-07-05T22:00:00Z", resolves_at: "2026-07-06T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("us"),     flag_url: FLAG("us") },
  { id: "fifa-10",   question: "Will Lionel Messi play at the FIFA World Cup 2026?",                     category: "FIFA 2026", yes_probability: 0.72, volume_usdt: 11200000, liquidity_usdt: 2240000, trader_count: 18900, closes_at: "2026-06-11T00:00:00Z", resolves_at: "2026-06-11T23:59:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("ar"),     flag_url: FLAG("ar") },
  { id: "fifa-7",    question: "Will Kylian Mbappe win the Golden Boot at World Cup 2026?",              category: "FIFA 2026", yes_probability: 0.31, volume_usdt: 3200000,  liquidity_usdt: 640000,  trader_count: 5100,  closes_at: "2026-07-19T22:00:00Z", resolves_at: "2026-07-20T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("fr"),     flag_url: FLAG("fr") },
  { id: "fifa-8",    question: "Will there be a VAR controversy in the World Cup 2026 final?",           category: "FIFA 2026", yes_probability: 0.61, volume_usdt: 1800000,  liquidity_usdt: 360000,  trader_count: 3870,  closes_at: "2026-07-19T22:00:00Z", resolves_at: "2026-07-20T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: "https://upload.wikimedia.org/wikipedia/en/a/a9/FIFA_logo_without_slogan.svg" },
  { id: "fifa-host", question: "Will a host nation (USA/Canada/Mexico) reach the semifinals?",           category: "FIFA 2026", yes_probability: 0.41, volume_usdt: 3800000,  liquidity_usdt: 760000,  trader_count: 6200,  closes_at: "2026-07-14T22:00:00Z", resolves_at: "2026-07-15T00:00:00Z", resolution_source: "https://fifa.com", resolved: false, image_url: FLAG("us"),     flag_url: FLAG("us") },
  { id: "crypto-1",  question: "Will Bitcoin exceed $110,000 by end of Q3 2026?",                       category: "Crypto",    yes_probability: 0.68, volume_usdt: 4200000,  liquidity_usdt: 840000,  trader_count: 3821,  closes_at: "2026-09-30T23:59:59Z", resolution_source: "https://coinmarketcap.com", resolved: false, image_url: COINS.bitcoin },
  { id: "crypto-2",  question: "Will a spot XRP ETF be approved in the US by December 2026?",           category: "Crypto",    yes_probability: 0.71, volume_usdt: 3400000,  liquidity_usdt: 680000,  trader_count: 2998,  closes_at: "2026-12-31T23:59:59Z", resolution_source: "https://sec.gov",             resolved: false, image_url: COINS.xrp },
  { id: "crypto-3",  question: "Will BNB Chain process 10M daily transactions by October 2026?",        category: "Crypto",    yes_probability: 0.59, volume_usdt: 780000,   liquidity_usdt: 156000,  trader_count: 643,   closes_at: "2026-10-31T23:59:59Z", resolution_source: "https://bscscan.com",         resolved: false, image_url: COINS.bnb },
  { id: "defi-1",    question: "Will Ethereum ETF daily volume surpass Bitcoin ETF by August 2026?",     category: "DeFi",      yes_probability: 0.31, volume_usdt: 1800000,  liquidity_usdt: 360000,  trader_count: 1204,  closes_at: "2026-08-31T23:59:59Z", resolution_source: "https://etf.com",             resolved: false, image_url: COINS.ethereum },
  { id: "defi-2",    question: "Will Solana flip Ethereum in daily DEX volume by 2026 year-end?",        category: "DeFi",      yes_probability: 0.42, volume_usdt: 2300000,  liquidity_usdt: 460000,  trader_count: 2187,  closes_at: "2026-12-31T23:59:59Z", resolution_source: "https://defillama.com",       resolved: false, image_url: COINS.solana },
  { id: "layer2-1",  question: "Will a new Layer-2 token enter top 20 CMC before July 2026?",            category: "Layer2",    yes_probability: 0.54, volume_usdt: 920000,   liquidity_usdt: 184000,  trader_count: 876,   closes_at: "2026-07-31T23:59:59Z", resolution_source: "https://coinmarketcap.com",   resolved: false, image_url: COINS.ethereum },
  { id: "layer2-2",  question: "Will Arbitrum TVL exceed $10B by Q4 2026?",                              category: "Layer2",    yes_probability: 0.47, volume_usdt: 1100000,  liquidity_usdt: 220000,  trader_count: 921,   closes_at: "2026-12-31T23:59:59Z", resolution_source: "https://defillama.com/chain/Arbitrum", resolved: false, image_url: COINS.arbitrum },
  { id: "macro-1",   question: "Will the Fed cut interest rates before September 2026?",                  category: "Macro",     yes_probability: 0.77, volume_usdt: 6100000,  liquidity_usdt: 1220000, trader_count: 5102,  closes_at: "2026-09-01T00:00:00Z", resolution_source: "https://federalreserve.gov",  resolved: false, image_url: FLAG("us") },
  { id: "macro-2",   question: "Will US CPI inflation fall below 2% before December 2026?",              category: "Macro",     yes_probability: 0.44, volume_usdt: 3800000,  liquidity_usdt: 760000,  trader_count: 3410,  closes_at: "2026-12-01T00:00:00Z",                                           resolved: false, image_url: FLAG("us") },
  { id: "feat-1",    question: "Will AI surpass human performance on all MMLU benchmarks by end of 2026?",category: "Featured",  yes_probability: 0.83, volume_usdt: 9800000,  liquidity_usdt: 1960000, trader_count: 14200, closes_at: "2026-12-31T23:59:59Z",                                           resolved: false },
];

const { data, error } = await supabase.from("markets").upsert(markets, { onConflict: "id" }).select();
if (error) { console.error("Error:", error.message); process.exit(1); }
console.log(`✅ Seeded ${data?.length ?? 0} markets into Supabase.`);
