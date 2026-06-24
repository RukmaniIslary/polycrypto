import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { calcSharesReceived } from "@/lib/utils";
import { verifyPrivyToken } from "@/lib/privy-server";

export async function POST(req: NextRequest) {
  const userId = await verifyPrivyToken(req.headers.get("Authorization"));
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { market_id, side, amount_usdt } = body;

  if (!market_id || !side || !amount_usdt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["YES", "NO"].includes(side)) {
    return NextResponse.json({ error: "Invalid side" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Get market
  const { data: market, error: marketErr } = await supabase
    .from("markets")
    .select("*")
    .eq("id", market_id)
    .single();

  if (marketErr || !market) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  if (market.resolved) {
    return NextResponse.json({ error: "Market is closed" }, { status: 400 });
  }

  // Get user balance
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("usdt_balance")
    .eq("id", userId)
    .single();

  if (userErr || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.usdt_balance < amount_usdt) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // AMM pricing
  const price = side === "YES" ? market.yes_probability : 1 - market.yes_probability;
  const shares = calcSharesReceived(amount_usdt, market.liquidity_usdt);

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      market_id,
      side,
      shares,
      price_per_share: price,
      total_cost_usdt: amount_usdt,
      status: "filled",
    })
    .select()
    .single();

  if (orderErr) {
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }

  // Update user balance
  const newBalance = user.usdt_balance - amount_usdt;
  await supabase
    .from("users")
    .update({ usdt_balance: newBalance, total_volume: ((user as { total_volume?: number }).total_volume ?? 0) + amount_usdt })
    .eq("id", userId);

  // Upsert position
  const { data: existing } = await supabase
    .from("positions")
    .select("*")
    .eq("user_id", userId)
    .eq("market_id", market_id)
    .eq("side", side)
    .single();

  if (existing) {
    const newShares = existing.shares + shares;
    const newAvgPrice = (existing.shares * existing.avg_price + shares * price) / newShares;
    await supabase
      .from("positions")
      .update({ shares: newShares, avg_price: newAvgPrice })
      .eq("id", existing.id);
  } else {
    await supabase.from("positions").insert({
      user_id: userId,
      market_id,
      side,
      shares,
      avg_price: price,
    });
  }

  return NextResponse.json({
    order,
    shares_received: shares,
    price_per_share: price,
    new_balance: newBalance,
  });
}
