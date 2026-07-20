/**
 * Syncs real active markets from Polymarket's public Gamma API into Supabase.
 * Call this manually or set up a cron to keep markets fresh.
 * GET /api/sync-markets?secret=YOUR_CRON_SECRET
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface PolyMarket {
  id: string;
  question: string;
  category: string;
  endDate: string;
  image: string;
  icon: string;
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  outcomes: string;        // JSON string e.g. '["Yes","No"]'
  outcomePrices: string;   // JSON string e.g. '["0.72","0.28"]'
}

function mapCategory(raw: string): string {
  const c = raw?.toLowerCase() ?? "";
  if (c.includes("crypto") || c.includes("bitcoin") || c.includes("eth")) return "Crypto";
  if (c.includes("soccer") || c.includes("football") || c.includes("sport")) return "Sports";
  if (c.includes("politic") || c.includes("election") || c.includes("trump")) return "Politics";
  if (c.includes("defi") || c.includes("blockchain")) return "DeFi";
  return "Featured";
}

export async function GET(req: NextRequest) {
  // Simple auth
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch top active markets from Polymarket Gamma API
    const res = await fetch(
      "https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=50&order=volume&ascending=false",
      { headers: { "Accept": "application/json" }, cache: "no-store" }
    );

    if (!res.ok) throw new Error(`Polymarket API error: ${res.status}`);
    const markets: PolyMarket[] = await res.json();

    const supabase = getSupabaseAdmin();
    let synced = 0;

    for (const m of markets) {
      try {
        let yesProbability = 0.5;
        if (m.outcomePrices) {
          const prices = JSON.parse(m.outcomePrices);
          yesProbability = parseFloat(prices[0]) || 0.5;
        }

        await supabase.from("markets").upsert({
          id: `poly-${m.id}`,
          question: m.question,
          category: mapCategory(m.category),
          yes_probability: yesProbability,
          volume_usdt: Math.round(m.volume ?? 0),
          liquidity_usdt: Math.round(m.liquidity ?? 0),
          trader_count: 0,
          closes_at: m.endDate,
          resolved: false,
          image_url: m.image ?? m.icon ?? null,
          resolution_source: `https://polymarket.com/event/${m.id}`,
        }, { onConflict: "id" });

        synced++;
      } catch {}
    }

    return NextResponse.json({ ok: true, synced, total: markets.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
