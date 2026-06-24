/**
 * Called when user taps "I've sent my funds".
 * Logs the intent so the cron job can prioritize checking for this user's deposit.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPrivyToken } from "@/lib/privy-server";

export async function POST(req: NextRequest) {
  const userId = await verifyPrivyToken(req.headers.get("Authorization"));
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chain } = await req.json();
  const supabase = getSupabaseAdmin();

  // Log deposit intent — cron job uses this to prioritize checking
  await supabase.from("deposit_logs").insert({
    user_id: userId,
    tx_id: `pending_${userId}_${Date.now()}`,
    amount: 0,
    chain_id: chain,
    status: "pending",
    credited_at: new Date().toISOString(),
  }).select();

  return NextResponse.json({ ok: true });
}
