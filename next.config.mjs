/** @type {import('next').NextConfig} */
const nextConfig = {
  // All pages are dynamic (Telegram Mini App — no static prerendering needed)
  // This prevents build-time errors when env vars are not set
  output: "standalone",
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
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
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://web.telegram.org https://t.me",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
