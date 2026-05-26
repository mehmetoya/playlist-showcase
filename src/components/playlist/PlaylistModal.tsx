"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Music, Users, Sparkles, Send, ChevronDown } from "lucide-react";
import { formatFollowers } from "@/lib/utils";
import { useAIChat } from "@/hooks/useAIAnalysis";
import { cn } from "@/lib/utils";
import type { Playlist, AIAnalysis, PlaylistTrack } from "@/types";

interface PlaylistModalProps {
  playlist: Playlist | null;
  analysis: AIAnalysis | null;
  onClose: () => void;
}

export function PlaylistModal({ playlist, analysis, onClose }: PlaylistModalProps) {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tracks" | "chat">("overview");
  const { messages, loading: chatLoading, sendMessage } = useAIChat(playlist?.id ?? "");
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch tracks when modal opens
  useEffect(() => {
    if (!playlist) return;
    setTracks([]);
    setTracksLoading(true);
    fetch(`/api/playlists/${playlist.id}/tracks?limit=50`)
      .then((r) => r.json())
      .then((json) => { if (json.data) setTracks(json.data); })
      .catch(console.error)
      .finally(() => setTracksLoading(false));
  }, [playlist?.id]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSend = () => {
    if (!input.trim() || chatLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <AnimatePresence>
      {playlist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="relative z-10 w-full sm:max-w-2xl bg-spotify-surface border border-spotify-border overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Green accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-spotify-green via-spotify-green/50 to-transparent" />

            {/* Hero section */}
            <div className="relative flex gap-5 p-5 pb-4">
              {/* Blurred cover bg */}
              {playlist.coverUrl && (
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url(${playlist.coverUrl})`,
                    backgroundSize: "cover",
                    filter: "blur(30px)",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-spotify-surface" />

              {/* Cover */}
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden shadow-2xl">
                {playlist.coverUrl ? (
                  <Image src={playlist.coverUrl} alt={playlist.name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full bg-spotify-card flex items-center justify-center">
                    <Music className="w-8 h-8 text-spotify-green/30" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="relative flex-1 min-w-0">
                <div className="text-[0.55rem] font-code tracking-[3px] uppercase text-spotify-green mb-1">Playlist</div>
                <h2 className="font-editorial text-2xl text-white leading-tight line-clamp-2 mb-2">{playlist.name}</h2>
                <div className="text-xs font-code text-spotify-muted">{playlist.owner.name}</div>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[0.65rem] font-code text-spotify-muted">
                    <Music className="w-3 h-3" />{playlist.trackCount}
                  </span>
                  {playlist.followers > 0 && (
                    <span className="flex items-center gap-1 text-[0.65rem] font-code text-spotify-muted">
                      <Users className="w-3 h-3" />{formatFollowers(playlist.followers)}
                    </span>
                  )}
                </div>
              </div>

              {/* Close */}
              <button onClick={onClose} className="absolute top-4 right-4 text-spotify-muted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-spotify-border px-5 gap-0">
              {(["overview", "tracks", "chat"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-[0.6rem] font-code tracking-widest uppercase transition-colors border-b-2 -mb-[1px]",
                    activeTab === tab
                      ? "border-spotify-green text-spotify-green"
                      : "border-transparent text-spotify-muted hover:text-white/70"
                  )}
                >
                  {tab === "chat" ? "✦ Ask AI" : tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">

              {/* Overview */}
              {activeTab === "overview" && (
                <div className="p-5 space-y-5">
                  {playlist.description && (
                    <p className="font-body italic text-spotify-muted text-sm leading-relaxed">
                      {playlist.description}
                    </p>
                  )}

                  {/* AI Analysis */}
                  {analysis ? (
                    <div className="border border-spotify-green/20 bg-spotify-green/[0.03] p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-spotify-green animate-pulse-dot" />
                        <span className="text-[0.55rem] font-code tracking-[3px] uppercase text-spotify-green">Claude Analysis</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Mood", val: analysis.mood },
                          { label: "Style", val: analysis.styleImpression },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="text-[0.55rem] font-code uppercase tracking-wider text-spotify-muted/60 mb-0.5">{item.label}</div>
                            <div className="text-xs font-code text-white/80">{item.val}</div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-spotify-border">
                        <div className="text-[0.55rem] font-code uppercase tracking-wider text-spotify-muted/60 mb-2">Review</div>
                        <p className="font-body italic text-white/70 text-sm leading-relaxed whitespace-pre-line">
                          {analysis.poeticReview}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-spotify-border p-4 text-center">
                      <Sparkles className="w-6 h-6 text-spotify-green/40 mx-auto mb-2" />
                      <p className="text-xs font-code text-spotify-muted">
                        No analysis yet. Click ✦ AI on the card to generate one.
                      </p>
                    </div>
                  )}

                  {/* Open in Spotify */}
                  <a
                    href={playlist.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 w-full bg-spotify-green text-black font-code text-xs tracking-widest uppercase px-4 py-3 hover:bg-spotify-green/90 transition-colors justify-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Spotify
                  </a>
                </div>
              )}

              {/* Tracks */}
              {activeTab === "tracks" && (
                <div className="py-2">
                  {tracksLoading ? (
                    <div className="flex gap-1.5 justify-center py-8">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-spotify-green animate-bounce3" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  ) : tracks.length === 0 ? (
                    <p className="text-center text-spotify-muted text-sm py-8">No tracks available</p>
                  ) : (
                    tracks.map((track, i) => (
                      <a key={track.id} href={track.spotifyUrl} target="_blank" rel="noreferrer" className="no-underline">
                        <div className="group grid grid-cols-[1.5rem_40px_1fr] items-center gap-3 px-5 py-2 hover:bg-spotify-card transition-colors">
                          <span className="text-[0.65rem] font-code text-spotify-muted/60 text-right group-hover:text-spotify-green transition-colors">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="relative w-10 h-10 flex-shrink-0">
                            {track.albumCover ? (
                              <Image src={track.albumCover} alt={track.albumName} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="w-full h-full bg-spotify-card" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-editorial text-white/80 truncate group-hover:text-white transition-colors">{track.name}</div>
                            <div className="text-[0.65rem] font-code text-spotify-muted truncate">{track.artists.join(", ")}</div>
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}

              {/* Chat */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full min-h-[300px]">
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-6">
                        <Sparkles className="w-8 h-8 text-spotify-green/30 mx-auto mb-3" />
                        <p className="text-xs font-code text-spotify-muted mb-1">Ask anything about this playlist</p>
                        <p className="text-[0.65rem] font-body italic text-spotify-muted/60">
                          "What mood is this?", "Best time to listen?", "Who made this?"
                        </p>
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] px-4 py-2.5 text-sm",
                          msg.role === "user"
                            ? "bg-spotify-green text-black font-code text-xs"
                            : "border border-spotify-border bg-spotify-card font-body italic text-white/80 leading-relaxed"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex gap-1.5 pl-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-spotify-green animate-bounce3" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-spotify-border p-3 flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about this playlist..."
                      className="flex-1 bg-spotify-card border border-spotify-border px-3 py-2 text-xs font-code text-white placeholder-spotify-muted/60 outline-none focus:border-spotify-green transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || chatLoading}
                      className="px-3 py-2 bg-spotify-green text-black hover:bg-spotify-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
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
