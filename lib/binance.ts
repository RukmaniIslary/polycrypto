import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 64 hex chars = 32 bytes

export function encryptApiKey(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptApiKey(ciphertext: string): string {
  const [ivHex, encHex] = ciphertext.split(":");
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export interface BinanceClientConfig {
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
}

const BASE_URL = process.env.BINANCE_TESTNET === "true"
  ? "https://testnet.binance.vision/api"
  : "https://api.binance.com/api";

function signQuery(query: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(query).digest("hex");
}

export async function binanceFetch(
  path: string,
  config: BinanceClientConfig,
  extraParams: Record<string, string | number> = {}
) {
  const timestamp = Date.now();
  const params = new URLSearchParams({
    ...Object.fromEntries(Object.entries(extraParams).map(([k, v]) => [k, String(v)])),
    timestamp: String(timestamp),
    recvWindow: "60000",
  });
  const signature = signQuery(params.toString(), config.apiSecret);
  params.append("signature", signature);

  const res = await fetch(`${BASE_URL}${path}?${params.toString()}`, {
    headers: { "X-MBX-APIKEY": config.apiKey },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg ?? "Binance API error");
  }
  return res.json();
}

export async function getBinanceUSDTBalance(config: BinanceClientConfig): Promise<number> {
  const data = await binanceFetch("/v3/account", config);
  const usdt = data.balances?.find((b: { asset: string }) => b.asset === "USDT");
  return parseFloat(usdt?.free ?? "0");
}

export async function getBinanceDepositAddress(config: BinanceClientConfig): Promise<{ address: string; coin: string; tag?: string }> {
  const res = await fetch(
    `${BASE_URL.replace("/api", "")}/sapi/v1/capital/deposit/address?coin=USDT&network=TRX&timestamp=${Date.now()}&recvWindow=60000&signature=${signQuery(`coin=USDT&network=TRX&timestamp=${Date.now()}&recvWindow=60000`, config.apiSecret)}`,
    { headers: { "X-MBX-APIKEY": config.apiKey } }
  );
  return res.json();
}
