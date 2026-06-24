import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { decryptApiKey, binanceFetch } from "@/lib/binance";
import { verifyPrivyToken } from "@/lib/privy-server";

export async function POST(req: NextRequest) {
  const userId = await verifyPrivyToken(req.headers.get("Authorization"));
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { address, amount } = body;

  if (!address || !amount || amount < 1) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check user platform balance
  const { data: user } = await supabase
    .from("users")
    .select("usdt_balance, binance_api_key_enc, binance_secret_enc")
    .eq("id", userId)
    .single();

  if (!user || user.usdt_balance < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  if (!user.binance_api_key_enc) {
    return NextResponse.json({ error: "Binance not connected" }, { status: 400 });
  }

  try {
    const apiKey = decryptApiKey(user.binance_api_key_enc);
    const apiSecret = decryptApiKey(user.binance_secret_enc);

    await binanceFetch(
      "/v3/capital/withdraw/apply",
      { apiKey, apiSecret },
      { coin: "USDT", network: "TRX", address, amount }
    );

    // Deduct from platform balance
    await supabase
      .from("users")
      .update({ usdt_balance: user.usdt_balance - amount })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Withdrawal failed" }, { status: 500 });
  }
}
