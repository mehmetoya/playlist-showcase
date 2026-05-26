"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { FilterBar } from "@/components/layout/FilterBar";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { PlaylistModal } from "@/components/playlist/PlaylistModal";
import { AIAnalysisPanel } from "@/components/ai/AIAnalysisPanel";
import { usePlaylists, useFilteredPlaylists } from "@/hooks/usePlaylists";
import type { Playlist, FilterState, AIAnalysis } from "@/types";

interface DashboardClientProps {
  user: { id: string; name: string; imageUrl: string | null };
}

export function DashboardClient({ user }: DashboardClientProps) {
  const { playlists, loading, error, refetch } = usePlaylists();

  const [filter, setFilter] = useState<FilterState>({
    search: "",
    sort: "default",
    view: "grid",
  });

  // Playlist detail modal
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // AI analysis panel
  const [analyzingPlaylist, setAnalyzingPlaylist] = useState<Playlist | null>(null);

  // Cache of analyses keyed by playlist ID
  const [analyses, setAnalyses] = useState<Record<string, AIAnalysis>>({});

  const filtered = useFilteredPlaylists(playlists, filter);

  const handleFilterChange = (next: Partial<FilterState>) =>
    setFilter((prev) => ({ ...prev, ...next }));

  const handleAnalysisReady = (playlistId: string, analysis: AIAnalysis | null) => {
    if (analysis) setAnalyses((prev) => ({ ...prev, [playlistId]: analysis }));
  };

  // Stats
  const totalTracks = playlists.reduce((s, p) => s + p.trackCount, 0);
  const totalFollowers = playlists.reduce((s, p) => s + p.followers, 0);

  return (
    <div className="min-h-screen bg-spotify-black flex flex-col">
      <Header user={user} />

      {/* Hero stats bar */}
      <div className="border-b border-spotify-border px-6 md:px-10 py-3 flex gap-6 overflow-x-auto">
        {[
          { label: "Playlists", value: playlists.length || "—" },
          { label: "Total Tracks", value: totalTracks ? totalTracks.toLocaleString() : "—" },
          {
            label: "Followers",
            value: totalFollowers > 0 ? (totalFollowers >= 1000 ? `${(totalFollowers / 1000).toFixed(1)}K` : totalFollowers) : "—",
          },
          { label: "Analyses", value: Object.keys(analyses).length || "—" },
        ].map((s) => (
          <div key={s.label} className="flex-shrink-0">
            <div className="font-display text-2xl text-spotify-green leading-none">{s.value}</div>
            <div className="text-[0.55rem] font-code uppercase tracking-widest text-spotify-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <FilterBar
        filter={filter}
        total={playlists.length}
        filtered={filtered.length}
        onChange={handleFilterChange}
      />

      {/* Main content */}
      <main className="flex-1 px-6 md:px-10 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-spotify-green animate-bounce3"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-xs font-code text-spotify-muted tracking-widest">Loading playlists...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-red-400 text-sm font-code">{error}</p>
            <button
              onClick={refetch}
              className="text-xs font-code tracking-widest uppercase border border-spotify-border text-spotify-muted px-4 py-2 hover:border-white/30 hover:text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Music2 className="w-12 h-12 text-spotify-border" />
            <p className="font-display text-3xl tracking-widest text-spotify-border">
              {playlists.length === 0 ? "NO PLAYLISTS" : "NO RESULTS"}
            </p>
            <p className="text-xs font-code text-spotify-muted">
              {playlists.length === 0
                ? "No playlists found on your Spotify account."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            {filter.view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[1px] bg-spotify-border border border-spotify-border">
                <AnimatePresence mode="popLayout">
                  {filtered.map((playlist, i) => (
                    <div key={playlist.id} className="bg-spotify-black">
                      <PlaylistCard
                        playlist={playlist}
                        index={i}
                        view="grid"
                        onSelect={setSelectedPlaylist}
                        onAnalyze={setAnalyzingPlaylist}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="border border-spotify-border">
                {/* List header */}
                <div className="grid grid-cols-[2.5rem_56px_1fr_auto_auto] gap-4 px-6 py-2 border-b border-spotify-border">
                  <span className="text-[0.5rem] font-code uppercase tracking-widest text-spotify-muted/40 text-right">#</span>
                  <span />
                  <span className="text-[0.5rem] font-code uppercase tracking-widest text-spotify-muted/40">Title</span>
                  <span className="text-[0.5rem] font-code uppercase tracking-widest text-spotify-muted/40 hidden sm:block">Details</span>
                  <span />
                </div>
                <AnimatePresence mode="popLayout">
                  {filtered.map((playlist, i) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      index={i}
                      view="list"
                      onSelect={setSelectedPlaylist}
                      onAnalyze={setAnalyzingPlaylist}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <PlaylistModal
        playlist={selectedPlaylist}
        analysis={selectedPlaylist ? analyses[selectedPlaylist.id] ?? null : null}
        onClose={() => setSelectedPlaylist(null)}
      />

      <AIAnalysisPanel
        playlist={analyzingPlaylist}
        onClose={() => setAnalyzingPlaylist(null)}
        onAnalysisReady={handleAnalysisReady}
      />
    </div>
  );
}
