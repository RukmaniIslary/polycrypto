# PolyCrypto

**Predict the Market. Own the Outcome.**

A production-ready Telegram Mini App prediction market platform modeled after Polymarket. Built with Next.js 14, Privy auth, Supabase, and Binance integration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + custom design system |
| Auth | Privy (`@privy-io/react-auth`) |
| Telegram | `@twa-dev/sdk` |
| Exchange | Binance API (REST) |
| Charts | Recharts |
| State | Zustand |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL + Realtime) |
| Deployment | Vercel |

---

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd polycrypto
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

Required:
- `NEXT_PUBLIC_PRIVY_APP_ID` — from [privy.io](https://privy.io)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN` — from @BotFather
- `ENCRYPTION_KEY` — 64 hex chars (32 bytes) for AES-256

### 3. Database Setup

Run the schema in your Supabase SQL editor:

```bash
# Copy contents of supabase/schema.sql and run in Supabase dashboard
```

### 4. Seed Markets

```bash
npx ts-node scripts/seed.ts
```

### 5. Generate Icons

```bash
npm run generate-icons
```

### 6. Development

```bash
npm run dev
```

---

## Telegram Bot Setup

1. Message `@BotFather` on Telegram
2. `/newbot` → Name: `PolyCrypto` → Username: `@PolyCryptoBot`
3. `/newapp` → Set Web App URL to your deployed URL
4. Set webhook after deploying to Vercel:

```bash
curl -X POST https://api.telegram.org/bot{YOUR_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://polycrypto.vercel.app/api/telegram/webhook", "secret_token": "YOUR_SECRET"}'
```

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Set all environment variables in the Vercel dashboard under Settings → Environment Variables.

---

## Project Structure

```
polycrypto/
├── app/                    # Next.js App Router pages + API routes
├── components/             # React components
│   ├── layout/             # TopBar, BottomNav, PageWrapper
│   ├── markets/            # MarketCard, PriceChart, OrderBook, etc.
│   ├── trading/            # TradingPanel
│   ├── portfolio/          # PositionCard, PnLSummary, HistoryTable
│   ├── binance/            # BalanceWidget, DepositModal, WithdrawModal
│   ├── auth/               # LoginGate
│   └── ui/                 # Toast, Skeleton, EmptyState, PriceTag
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, API clients
├── store/                  # Zustand global state
├── types/                  # TypeScript interfaces
├── supabase/               # SQL schema
├── scripts/                # Seed + icon generation
└── telegram-bot/           # Bot configuration helper
```

---

*PolyCrypto © 2026*
