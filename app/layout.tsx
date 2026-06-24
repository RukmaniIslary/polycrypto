import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  metadataBase: new URL("https://polycrypto-opal.vercel.app"),
  title: "PolyCrypto — Predict. Trade. Win.",
  description: "Crypto prediction markets on Telegram",
  manifest: "/manifest.json",
  icons: { icon: "/icons/icon-192.png" },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1,
  userScalable: false, themeColor: "#0A0B0F",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0A0B0F", color: "#F1F5F9", margin: 0 }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
