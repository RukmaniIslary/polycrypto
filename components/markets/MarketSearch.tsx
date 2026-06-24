"use client";

import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MarketSearchProps {
  search: string;
  onSearch: (v: string) => void;
  sort: string;
  onSort: (v: "volume" | "newest" | "ending" | "hot") => void;
}

const SORT_OPTIONS = [
  { value: "volume", label: "Volume" },
  { value: "newest", label: "Newest" },
  { value: "ending", label: "Ending Soon" },
  { value: "hot", label: "Hot" },
] as const;

export function MarketSearch({ search, onSearch, sort, onSort }: MarketSearchProps) {
  const [showSort, setShowSort] = useState(false);

  return (
    <div className="px-4 pb-3 flex items-center gap-2 relative">
      {/* Search input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search markets..."
          className="w-full bg-bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-dim outline-none focus:border-accent-blue/50 transition-colors"
        />
      </div>

      {/* Sort button */}
      <div className="relative">
        <button
          onClick={() => setShowSort((v) => !v)}
          className="flex items-center gap-1.5 bg-bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-secondary tap-scale"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <ChevronDown className={cn("w-3 h-3 transition-transform", showSort && "rotate-180")} />
        </button>

        {showSort && (
          <div className="absolute right-0 top-full mt-1 bg-bg-elevated border border-border rounded-xl overflow-hidden z-20 min-w-[140px] shadow-2xl">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onSort(opt.value); setShowSort(false); }}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-bg-surface",
                  sort === opt.value ? "text-accent-blue font-medium" : "text-text-secondary"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
