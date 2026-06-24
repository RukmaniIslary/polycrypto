/** @type {import('next').NextConfig} */
const nextConfig = {
  // All pages are dynamic (Telegram Mini App — no static prerendering needed)
  // This prevents build-time errors when env vars are not set
  output: "standalone",
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
  // Stub optional peer deps that @privy-io/react-auth references but we don't use
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@stripe/crypto": false,
      "@farcaster/mini-app-solana": false,
    };
    return config;
  },
  images: {
    domains: [
      "t.me",
      "telegram.org",
      "assets.coingecko.com",
      "coin-images.coingecko.com",
      "flagcdn.com",
      "upload.wikimedia.org",
      "randomuser.me",
      "avatars.githubusercontent.com",
      "pbs.twimg.com",
      "img.a.transfermarkt.technology",
      "tmssl.akamaized.net",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "**.wikimedia.org" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Allow Telegram to embed this app as a Mini App
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            value: [
              // Who can embed THIS app (Telegram Mini App)
              "frame-ancestors 'self' https://web.telegram.org https://t.me https://*.telegram.org",
              // Privy auth iframe (wallet + telegram + email flows)
              "frame-src 'self' https://auth.privy.io https://*.privy.io https://verify.walletconnect.com https://verify.walletconnect.org",
              // Privy API + WalletConnect + Supabase websockets
              "connect-src 'self' https://*.privy.io wss://*.privy.io https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://*.supabase.co wss://*.supabase.co https://api.telegram.org https://rpc.walletconnect.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
