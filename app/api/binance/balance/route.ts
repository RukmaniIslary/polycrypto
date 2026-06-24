import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getBinanceUSDTBalance, decryptApiKey } from "@/lib/binance";

// Simple in-memory rate limit: 1 req per 10s per user
const lastFetch = new Map<string, number>();

async function getUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const token = auth.slice(7);
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return payload.sub ?? payload.userId ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
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
