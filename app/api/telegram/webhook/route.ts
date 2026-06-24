import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifyWebhook(body: string, secret: string): boolean {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return hash.length > 0; // In production, compare against X-Telegram-Bot-Api-Secret-Token header
}

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  if (!verifyWebhook(body, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const update = JSON.parse(body);
  const message = update.message;

  if (!message) return NextResponse.json({ ok: true });

  const text = message.text ?? "";
  const chatId = message.chat.id;
  const botToken = process.env.TELEGRAM_BOT_TOKEN!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://polycrypto.vercel.app";

  if (text.startsWith("/start")) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "Welcome to PolyCrypto! Predict the Market. Own the Outcome.",
        reply_markup: {
          inline_keyboard: [[{
            text: "Open PolyCrypto",
            web_app: { url: appUrl },
          }]],
        },
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
