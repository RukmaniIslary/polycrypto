import { cn } from "@/lib/utils";
import { BarChart2, Search, Wallet } from "lucide-react";

interface EmptyStateProps {
  icon?: "chart" | "search" | "wallet";
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const ICONS = {
  chart: BarChart2,
  search: Search,
  wallet: Wallet,
};

export function EmptyState({ icon = "chart", title, description, action, className }: EmptyStateProps) {
  const Icon = ICONS[icon];
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-dim" />
      </div>
      <h3 className="text-text-primary font-semibold text-base mb-1">{title}</h3>
      {description && <p className="text-text-secondary text-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
