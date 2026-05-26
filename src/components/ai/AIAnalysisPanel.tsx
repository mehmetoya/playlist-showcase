"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import type { Playlist } from "@/types";

interface AIAnalysisPanelProps {
  playlist: Playlist | null;
  onClose: () => void;
  onAnalysisReady?: (playlistId: string, analysis: ReturnType<typeof useAIAnalysis>["analysis"]) => void;
}

export function AIAnalysisPanel({ playlist, onClose, onAnalysisReady }: AIAnalysisPanelProps) {
  const { analysis, loading, error, analyze } = useAIAnalysis(playlist?.id ?? "");

  // Auto-trigger on mount
  useEffect(() => {
    if (playlist) analyze();
  }, [playlist?.id]);

  // Notify parent when done
  useEffect(() => {
    if (analysis && playlist && onAnalysisReady) {
      onAnalysisReady(playlist.id, analysis);
    }
  }, [analysis]);

  return (
    <AnimatePresence>
      {playlist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/92 backdrop-blur-2xl" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg bg-[#0c0c0c] border border-spotify-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-spotify-green to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-spotify-green animate-pulse-dot" />
                  <span className="text-[0.55rem] font-code tracking-[3px] uppercase text-spotify-green">
                    AI Analysis
                  </span>
                </div>
                <h3 className="font-editorial text-xl text-white leading-tight">{playlist.name}</h3>
              </div>
              <button onClick={onClose} className="text-spotify-muted hover:text-white transition-colors mt-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-6">
              {loading && (
                <div className="space-y-3">
                  <p className="text-[0.65rem] font-code text-spotify-muted/60 tracking-wider">
                    Analyzing playlist...
                  </p>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-spotify-green animate-bounce3"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  {/* Skeleton lines */}
                  <div className="space-y-2 mt-4">
                    {[100, 85, 92, 70].map((w, i) => (
                      <div key={i} className="h-3 bg-spotify-surface rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm font-code">{error}</p>
              )}

              {analysis && !loading && (
                <div className="space-y-4">
                  {/* Mood + context chips */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-spotify-green text-black text-[0.6rem] font-code tracking-widest uppercase">
                      {analysis.moodBadge}
                    </span>
                    <span className="px-3 py-1 border border-spotify-border text-[0.6rem] font-code tracking-widest uppercase text-spotify-muted">
                      {analysis.emotionalTone}
                    </span>
                  </div>

                  {/* Context */}
                  <div className="border-l-2 border-spotify-green/40 pl-3">
                    <p className="font-body italic text-white/60 text-sm leading-relaxed">
                      {analysis.listeningContext}
                    </p>
                  </div>

                  {/* Personality */}
                  <div>
                    <div className="text-[0.55rem] font-code uppercase tracking-wider text-spotify-muted/50 mb-1">Personality</div>
                    <p className="text-xs font-code text-white/70">{analysis.personality}</p>
                  </div>

                  {/* Poetic review */}
                  <div className="border-t border-spotify-border pt-4">
                    <div className="text-[0.55rem] font-code uppercase tracking-wider text-spotify-muted/50 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Editorial Review
                    </div>
                    <p className="font-body italic text-white/75 text-sm leading-relaxed whitespace-pre-line">
                      {analysis.poeticReview}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
