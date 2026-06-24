import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyPrivyToken } from "@/lib/privy-server";

export async function POST(req: NextRequest) {
  const userId = await verifyPrivyToken(req.headers.get("Authorization"));
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, txHash, chainId } = await req.json();

  if (!amount || !txHash || amount < 1) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Prevent double-crediting same tx
  const { data: existing } = await supabase
    .from("deposit_logs")
    .select("id")
    .eq("tx_id", txHash)
    .single();

  if (existing) {
    return NextResponse.json({ ok: true, alreadyCredited: true });
  }

  // Get current balance
  const { data: user } = await supabase
    .from("users")
    .select("usdt_balance")
    .eq("id", userId)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Credit balance
  const { error } = await supabase
    .from("users")
    .update({ usdt_balance: (user.usdt_balance ?? 0) + parseFloat(amount) })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log deposit
  await supabase.from("deposit_logs").insert({
    user_id: userId,
    tx_id: txHash,
    amount: parseFloat(amount),
    chain_id: chainId,
    credited_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, newBalance: (user.usdt_balance ?? 0) + parseFloat(amount) });
}
