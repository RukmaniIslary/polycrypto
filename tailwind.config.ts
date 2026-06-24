import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use actual hex values so Tailwind generates real CSS classes
        "bg-primary":    "#0A0B0F",
        "bg-surface":    "#12141A",
        "bg-elevated":   "#1A1D26",
        "border":        "#252836",
        "accent-blue":   "#3B82F6",
        "accent-green":  "#22C55E",
        "accent-red":    "#EF4444",
        "accent-amber":  "#F59E0B",
        "accent-purple": "#8B5CF6",
        "text-primary":  "#F1F5F9",
        "text-secondary":"#94A3B8",
        "text-dim":      "#475569",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body:    ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      maxWidth: {
        app: "430px",
      },
    },
  },
  plugins: [],
  // Safelist ensures these classes are always generated even if only in dynamic strings
  safelist: [
    "bg-bg-primary", "bg-bg-surface", "bg-bg-elevated",
    "text-text-primary", "text-text-secondary", "text-text-dim",
    "border-border",
    "text-accent-blue", "text-accent-green", "text-accent-red",
    "text-accent-amber", "text-accent-purple",
    "bg-accent-blue", "bg-accent-green", "bg-accent-red",
    "bg-accent-amber", "bg-accent-purple",
    // opacity variants used in cards
    "bg-accent-blue/20", "bg-accent-green/20", "bg-accent-red/20",
    "bg-accent-amber/20", "bg-accent-purple/20",
    "bg-accent-blue/15", "bg-accent-green/15", "bg-accent-red/15",
    "bg-accent-green/10", "bg-accent-blue/10",
    "border-accent-blue/30", "border-accent-blue/40",
    "border-accent-red/30", "border-accent-amber/20",
    "text-green-400", "bg-green-500/20",
  ],
};

export default config;
