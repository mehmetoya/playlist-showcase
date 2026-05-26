"use client";

import { Search, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterState, SortKey, ViewMode } from "@/types";

interface FilterBarProps {
  filter: FilterState;
  total: number;
  filtered: number;
  onChange: (next: Partial<FilterState>) => void;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "name", label: "Name" },
  { key: "tracks", label: "Tracks" },
  { key: "followers", label: "Followers" },
];

export function FilterBar({ filter, total, filtered, onChange }: FilterBarProps) {
  return (
    <div className="border-b border-spotify-border px-6 md:px-10 py-3 flex items-center gap-4 flex-wrap">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-spotify-muted pointer-events-none" />
        <input
          type="text"
          value={filter.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search playlists..."
          className="pl-8 pr-3 py-2 bg-spotify-card border border-spotify-border text-xs font-code text-white placeholder-spotify-muted/60 outline-none focus:border-spotify-green transition-colors w-44"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <span className="text-[0.55rem] font-code uppercase tracking-widest text-spotify-muted/60">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange({ sort: opt.key })}
            className={cn(
              "px-2.5 py-1.5 text-[0.6rem] font-code tracking-wider uppercase border transition-all duration-150",
              filter.sort === opt.key
                ? "border-spotify-green text-spotify-green bg-spotify-green-dim"
                : "border-spotify-border text-spotify-muted hover:border-white/30 hover:text-white/60"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="text-[0.6rem] font-code text-spotify-muted/50 ml-auto hidden sm:block">
        {filtered === total
          ? `${total} playlists`
          : `${filtered} / ${total}`}
      </div>

      {/* View toggle */}
      <div className="flex gap-1">
        {(["grid", "list"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => onChange({ view: v })}
            className={cn(
              "p-2 border transition-all duration-150",
              filter.view === v
                ? "border-spotify-green text-spotify-green bg-spotify-green-dim"
                : "border-spotify-border text-spotify-muted hover:border-white/30 hover:text-white/60"
            )}
            aria-label={`${v} view`}
          >
            {v === "grid" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
          </button>
        ))}
      </div>
    </div>
  );
}
