/**
 * PolyCrypto Telegram Bot
 *
 * Setup:
 * 1. Create bot via @BotFather → /newbot → PolyCrypto → @PolyCryptoBot
 * 2. /newapp → set Web App URL to https://polycrypto.vercel.app
 * 3. Set webhook: POST https://api.telegram.org/bot{TOKEN}/setWebhook
 *    body: { url: "https://polycrypto.vercel.app/api/telegram/webhook",
 *            secret_token: TELEGRAM_WEBHOOK_SECRET }
 * 4. Set commands:
 *    /setcommands → select @PolyCryptoBot
 *    start - Open PolyCrypto App
 *    markets - Browse prediction markets
 *    portfolio - View your positions
 *    balance - Check your USDT balance
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://polycrypto.vercel.app";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export function getLaunchKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "Open PolyCrypto",
          web_app: { url: APP_URL },
        },
      ],
      [
        { text: "Markets", callback_data: "markets" },
        { text: "Portfolio", callback_data: "portfolio" },
      ],
    ],
  };
}

export async function registerWebhook(webhookUrl: string, secret: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
    }),
  });
  return res.json();
}

export async function setBotCommands() {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "Open PolyCrypto App" },
        { command: "markets", description: "Browse prediction markets" },
        { command: "portfolio", description: "View your positions" },
        { command: "balance", description: "Check your USDT balance" },
      ],
    }),
  });
  return res.json();
}
