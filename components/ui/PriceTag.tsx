import { cn } from "@/lib/utils";

interface PriceTagProps {
  probability: number; // 0–1
  side?: "YES" | "NO";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceTag({ probability, side = "YES", size = "md", className }: PriceTagProps) {
  const pct = Math.round(probability * 100);
  const isYes = side === "YES";

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 rounded-md",
    md: "text-sm px-2.5 py-1 rounded-lg font-medium",
    lg: "text-base px-3 py-1.5 rounded-xl font-semibold",
  };

  return (
    <span
      className={cn(
        sizeClasses[size],
        isYes
          ? "bg-accent-green/15 text-accent-green"
          : "bg-accent-red/15 text-accent-red",
        className
      )}
    >
      {side} {pct}%
    </span>
  );
}

export function ProbabilityBar({ probability }: { probability: number }) {
  const pct = Math.round(probability * 100);
  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1D26" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #22C55E, #16A34A)",
          }}
        />
      </div>
      <span className="text-xs font-mono font-medium w-8 text-right" style={{ color: "#22C55E" }}>
        {pct}%
      </span>
    </div>
  );
}
