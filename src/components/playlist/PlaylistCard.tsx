"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Music, ExternalLink, Sparkles } from "lucide-react";
import { formatFollowers } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Playlist } from "@/types";

interface PlaylistCardProps {
  playlist: Playlist;
  index: number;
  onSelect: (playlist: Playlist) => void;
  onAnalyze: (playlist: Playlist) => void;
  view: "grid" | "list";
}

export function PlaylistCard({
  playlist,
  index,
  onSelect,
  onAnalyze,
  view,
}: PlaylistCardProps) {
  const [imgError, setImgError] = useState(false);

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="group grid grid-cols-[2.5rem_56px_1fr_auto_auto] items-center gap-4 px-6 py-3 border-b border-spotify-border hover:bg-spotify-surface transition-colors duration-150 cursor-pointer"
        onClick={() => onSelect(playlist)}
      >
        {/* Rank */}
        <span className="font-display text-2xl text-spotify-border group-hover:text-spotify-green transition-colors text-right tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Cover */}
        <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden bg-spotify-card">
          {playlist.coverUrl && !imgError ? (
            <Image
              src={playlist.coverUrl}
              alt={playlist.name}
              fill
              className="object-cover"
              sizes="56px"
              onError={() => setImgError(true)}
            />
          ) : (
            <PlaceholderCover />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="font-editorial text-base text-white/90 truncate group-hover:text-white transition-colors">
            {playlist.name}
          </div>
          <div className="text-xs font-code text-spotify-muted mt-0.5 truncate">
            {playlist.owner.name}
          </div>
        </div>

        {/* Stats */}
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-1 text-xs font-code text-spotify-muted justify-end">
            <Music className="w-3 h-3" />
            <span>{playlist.trackCount}</span>
          </div>
          {playlist.followers > 0 && (
            <div className="flex items-center gap-1 text-xs font-code text-spotify-muted justify-end mt-0.5">
              <Users className="w-3 h-3" />
              <span>{formatFollowers(playlist.followers)}</span>
            </div>
          )}
        </div>

        {/* AI button */}
        <button
          onClick={(e) => { e.stopPropagation(); onAnalyze(playlist); }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 border text-xs font-code tracking-widest uppercase transition-all duration-200",
            "border-spotify-border text-spotify-muted",
            "group-hover:border-spotify-green group-hover:text-spotify-green"
          )}
        >
          <Sparkles className="w-3 h-3" />
          AI
        </button>
      </motion.div>
    );
  }

  // ── Grid card ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="group relative bg-spotify-card border border-spotify-border hover:border-spotify-green/50 transition-all duration-300 cursor-pointer overflow-hidden"
      style={{
        boxShadow: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(29,185,84,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
      onClick={() => onSelect(playlist)}
    >
      {/* Green top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-spotify-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

      {/* Rank watermark */}
      <div className="absolute top-2 right-3 font-display text-[5rem] leading-none select-none pointer-events-none text-white/[0.04] group-hover:text-spotify-green/10 transition-colors duration-300 z-[1]">
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Cover */}
      <div className="relative aspect-square overflow-hidden bg-spotify-surface">
        {playlist.coverUrl && !imgError ? (
          <Image
            src={playlist.coverUrl}
            alt={playlist.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-[1.05] group-hover:brightness-75"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <PlaceholderCover large />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 rounded-full bg-spotify-green flex items-center justify-center shadow-[0_4px_24px_rgba(29,185,84,0.5)] scale-75 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="#000">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          </div>
        </div>

        {/* Public/private badge */}
        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[10px] font-code text-white/60 tracking-widest uppercase">
          {playlist.isPublic ? "Public" : "Private"}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-editorial text-[1.1rem] text-white/90 leading-tight mb-1.5 line-clamp-1 group-hover:text-white transition-colors">
          {playlist.name}
        </h3>

        {playlist.description && (
          <p className="font-body italic text-spotify-muted text-[0.72rem] leading-relaxed line-clamp-2 mb-3">
            {playlist.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-spotify-border">
          <div className="flex items-center gap-1.5 text-[0.65rem] font-code text-spotify-muted">
            <Music className="w-3 h-3" />
            <span>{playlist.trackCount} tracks</span>
          </div>
          {playlist.followers > 0 && (
            <div className="flex items-center gap-1.5 text-[0.65rem] font-code text-spotify-muted">
              <Users className="w-3 h-3" />
              <span>{formatFollowers(playlist.followers)}</span>
            </div>
          )}

          {/* AI button */}
          <button
            onClick={(e) => { e.stopPropagation(); onAnalyze(playlist); }}
            className={cn(
              "ml-auto flex items-center gap-1 px-2.5 py-1 border text-[0.6rem] font-code tracking-widest uppercase transition-all duration-200",
              "border-spotify-border text-spotify-muted bg-transparent",
              "group-hover:border-spotify-green/50 group-hover:text-spotify-green group-hover:bg-spotify-green-dim"
            )}
          >
            <Sparkles className="w-2.5 h-2.5" />
            AI
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PlaceholderCover({ large }: { large?: boolean }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-spotify-surface to-spotify-card">
      <svg
        className={cn("text-spotify-green/20", large ? "w-16 h-16" : "w-8 h-8")}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    </div>
  );
}
