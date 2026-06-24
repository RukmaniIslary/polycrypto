import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getBinanceUSDTBalance, decryptApiKey } from "@/lib/binance";
import { verifyPrivyToken } from "@/lib/privy-server";

// Simple in-memory rate limit: 1 req per 10s per user
const lastFetch = new Map<string, number>();

export async function GET(req: NextRequest) {
  const userId = await verifyPrivyToken(req.headers.get("Authorization"));
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit
  const now = Date.now();
  const last = lastFetch.get(userId) ?? 0;
  if (now - last < 10_000) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }
  lastFetch.set(userId, now);

  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase
    .from("users")
    .select("binance_api_key_enc, binance_secret_enc")
    .eq("id", userId)
    .single();

  if (!user?.binance_api_key_enc) {
    return NextResponse.json({ balance: null, connected: false });
  }

  try {
    const apiKey = decryptApiKey(user.binance_api_key_enc);
    const apiSecret = decryptApiKey(user.binance_secret_enc);
    const balance = await getBinanceUSDTBalance({ apiKey, apiSecret });
    return NextResponse.json({ balance, connected: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
