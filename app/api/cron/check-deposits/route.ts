/**
 * Cron job — runs every 5 minutes via Vercel Cron.
 * Checks recent Binance deposits, matches memo to user, credits their balance.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRecentDeposits } from "@/lib/binance-admin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // Protect with a secret so only Vercel cron can call this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  let deposits;
  try {
    deposits = await getRecentDeposits();
  } catch (err) {
    return NextResponse.json({ error: "Binance API error", detail: String(err) }, { status: 500 });
  }

  // Only process completed deposits (status === 1)
  const completed = deposits.filter((d) => d.status === 1);

  let credited = 0;
  let skipped = 0;

  for (const deposit of completed) {
    const memo = deposit.txId ? undefined : undefined; // memo comes from deposit tag
    // Binance TRC-20 deposits don't have a tag — we use a different approach:
    // Check if this txId was already processed
    const { data: existing } = await supabase
      .from("deposit_logs")
      .select("id")
      .eq("tx_id", deposit.txId)
      .single();

    if (existing) {
      skipped++;
      continue; // already credited
    }

    // Try to find user by memo in the amount comment or tag
    // For TRC-20, Binance includes addressTag in the deposit record
    const depositRecord = deposit as typeof deposit & { addressTag?: string };
    const userMemo = depositRecord.addressTag;

    if (!userMemo) {
      skipped++;
      continue; // no memo — can't identify user
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, usdt_balance")
      .eq("deposit_memo", userMemo)
      .single();

    if (!user) {
      skipped++;
      continue; // memo doesn't match any user
    }

    const amount = parseFloat(deposit.amount);
    if (amount < 1) {
      skipped++;
      continue; // below minimum
    }

    // Credit the user's balance
    const { error: updateErr } = await supabase
      .from("users")
      .update({ usdt_balance: (user.usdt_balance ?? 0) + amount })
      .eq("id", user.id);

    if (updateErr) {
      skipped++;
      continue;
    }

    // Log the deposit so we don't double-credit
    await supabase.from("deposit_logs").insert({
      user_id: user.id,
      tx_id: deposit.txId,
      amount,
      memo: userMemo,
      credited_at: new Date().toISOString(),
    });

    credited++;
  }

  return NextResponse.json({
    processed: completed.length,
    credited,
    skipped,
    timestamp: new Date().toISOString(),
  });
}
