import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getPlatformDepositAddress } from "@/lib/binance-admin";
import { verifyPrivyToken } from "@/lib/privy-server";
import crypto from "crypto";

/**
 * Returns the platform USDT deposit address + a unique memo for this user.
 * The user sends USDT to this address WITH their memo in the tag/memo field.
 * Your backend can then match the deposit to the user via the memo.
 */
export async function GET(req: NextRequest) {
  const userId = await verifyPrivyToken(req.headers.get("Authorization"));
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();

  // Get or create a deterministic memo for this user (short numeric, easy to type)
  const { data: userRow } = await supabase
    .from("users")
    .select("id, deposit_memo")
    .eq("id", userId)
    .single();

  let memo = userRow?.deposit_memo as string | null;

  if (!memo) {
    // Generate a 6-digit deterministic memo from user ID
    memo = parseInt(
      crypto.createHash("sha256").update(userId).digest("hex").slice(0, 8),
      16
    ).toString().slice(0, 6);

    // Store memo on user row (best effort — ignore error if column doesn't exist yet)
    await supabase
      .from("users")
      .update({ deposit_memo: memo })
      .eq("id", userId);
  }

  try {
    const { address, network } = await getPlatformDepositAddress();
    return NextResponse.json({ address, network, memo, coin: "USDT" });
  } catch (err) {
    // Fallback: return a static address if Binance API key not set up yet
    return NextResponse.json({
      address: process.env.FALLBACK_DEPOSIT_ADDRESS ?? "Contact support to get your deposit address",
      network: "TRC-20",
      memo,
      coin: "USDT",
      fallback: true,
    });
  }
}
