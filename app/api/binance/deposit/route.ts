import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { decryptApiKey, getBinanceDepositAddress } from "@/lib/binance";

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

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase
    .from("users")
    .select("binance_api_key_enc, binance_secret_enc")
    .eq("id", userId)
    .single();

  if (!user?.binance_api_key_enc) {
    // Return a placeholder for demo if no Binance connected
    return NextResponse.json({
      address: "TRx1234567890ABCDEF1234567890abcdef12",
      coin: "USDT",
      network: "TRC20",
      connected: false,
    });
  }

  try {
    const apiKey = decryptApiKey(user.binance_api_key_enc);
    const apiSecret = decryptApiKey(user.binance_secret_enc);
    const result = await getBinanceDepositAddress({ apiKey, apiSecret });
    return NextResponse.json({ ...result, connected: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
