import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PolyMarket {
  id: string;
  question: string;
  groupItemTitle?: string;
  category?: string;
  endDate: string;
  image?: string;
  icon?: string;
  volume?: number;
  liquidity?: number;
  outcomePrices?: string;
  outcomes?: string;
  active: boolean;
  closed: boolean;
  commentCount?: number;
}

function mapCategory(tags: string[], question: string): string {
  const text = [...tags, question].join(" ").toLowerCase();
  if (text.includes("bitcoin") || text.includes("crypto") || text.includes("eth") || text.includes("xrp") || text.includes("solana")) return "Crypto";
  if (text.includes("soccer") || text.includes("football") || text.includes("nba") || text.includes("nfl") || text.includes("sport") || text.includes("tennis") || text.includes("ufc") || text.includes("cricket")) return "Sports";
  if (text.includes("trump") || text.includes("election") || text.includes("president") || text.includes("congress") || text.includes("politic")) return "Politics";
  if (text.includes("defi") || text.includes("blockchain") || text.includes("nft")) return "DeFi";
  return "Featured";
}

export async function GET() {
  try {
    // Fetch top active markets directly from Polymarket — no API key needed
    const res = await fetch(
      "https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=50&order=volume&ascending=false",
      { next: { revalidate: 60 } } // cache 60s
    );

    if (!res.ok) throw new Error("Polymarket API unavailable");

    const raw: PolyMarket[] = await res.json();

    const markets = raw
      .filter((m) => m.active && !m.closed && m.endDate)
      .map((m) => {
        let yesProbability = 0.5;
        try {
          const prices = JSON.parse(m.outcomePrices ?? "[]");
          yesProbability = parseFloat(prices[0]) || 0.5;
        } catch {}

        return {
          id: `poly-${m.id}`,
          question: m.question,
          category: mapCategory([], m.question),
          yes_probability: yesProbability,
          volume_usdt: Math.round(m.volume ?? 0),
          liquidity_usdt: Math.round(m.liquidity ?? 0),
          trader_count: m.commentCount ?? 0,
          closes_at: m.endDate,
          resolves_at: m.endDate,
          resolved: false,
          image_url: m.image ?? m.icon ?? null,
          flag_url: null,
          resolution_source: `https://polymarket.com`,
          created_at: new Date().toISOString(),
        };
      });

    return NextResponse.json(markets);
  } catch (err) {
    // Fallback to Supabase if Polymarket is down
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("markets")
      .select("*")
      .order("volume_usdt", { ascending: false });
    return NextResponse.json(data ?? []);
  }
}
