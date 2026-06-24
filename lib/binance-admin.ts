/**
 * Admin Binance client — uses YOUR platform API keys from env vars.
 * Never expose these to the client. Only call from API routes.
 */
import crypto from "crypto";

const BASE_SAPI = "https://api.binance.com/sapi/v1";

function sign(query: string): string {
  return crypto
    .createHmac("sha256", process.env.BINANCE_SECRET_KEY!)
    .update(query)
    .digest("hex");
}

async function binanceAdminFetch(path: string, params: Record<string, string> = {}) {
  const timestamp = Date.now().toString();
  const query = new URLSearchParams({ ...params, timestamp, recvWindow: "60000" });
  query.append("signature", sign(query.toString()));

  const res = await fetch(`${BASE_SAPI}${path}?${query.toString()}`, {
    headers: { "X-MBX-APIKEY": process.env.BINANCE_API_KEY! },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg ?? "Binance error");
  return data;
}

/** Get the platform's USDT deposit address on TRC-20 */
export async function getPlatformDepositAddress(): Promise<{
  address: string;
  coin: string;
  tag?: string;
  network: string;
}> {
  const data = await binanceAdminFetch("/capital/deposit/address", {
    coin: "USDT",
    network: "TRX",
  });
  return {
    address: data.address,
    coin: "USDT",
    tag: data.tag || undefined,
    network: "TRC-20",
  };
}

/** Get recent USDT deposits (last 7 days) */
export async function getRecentDeposits(): Promise<Array<{
  txId: string;
  amount: string;
  address: string;
  status: number;
  insertTime: number;
}>> {
  const startTime = (Date.now() - 7 * 24 * 60 * 60 * 1000).toString();
  const data = await binanceAdminFetch("/capital/deposit/hisrec", {
    coin: "USDT",
    startTime,
    limit: "100",
  });
  return Array.isArray(data) ? data : [];
}

/** Get platform USDT balance */
export async function getPlatformUSDTBalance(): Promise<number> {
  const data = await binanceAdminFetch("/account");
  const balances: Array<{ asset: string; free: string }> = data.balances ?? [];
  const usdt = balances.find((b) => b.asset === "USDT");
  return parseFloat(usdt?.free ?? "0");
}
