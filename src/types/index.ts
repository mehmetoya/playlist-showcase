// ─── Spotify raw API shapes ────────────────────────────────────────────────────

export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  images?: SpotifyImage[];
  external_urls: { spotify: string };
}

export interface SpotifyTrackObject {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
  };
  duration_ms: number;
  external_urls: { spotify: string };
  preview_url: string | null;
}

export interface SpotifyPlaylistTrack {
  added_at: string | null;
  track: SpotifyTrackObject | null;
}

export interface SpotifyPlaylistRaw {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  tracks: { total: number; href: string };
  followers: { total: number };
  owner: SpotifyUser;
  public: boolean | null;
  snapshot_id: string;
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylistRaw[];
  total: number;
  next: string | null;
  offset: number;
  limit: number;
}

export interface SpotifyTracksResponse {
  items: SpotifyPlaylistTrack[];
  total: number;
  next: string | null;
  offset: number;
  limit: number;
}

// ─── App-level DTOs ──────────────────────────────────────────────────────────

export interface PlaylistTrack {
  id: string;
  name: string;
  artists: string[];
  albumName: string;
  albumCover: string | null;
  durationMs: number;
  spotifyUrl: string;
  previewUrl: string | null;
  addedAt: string | null;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string | null;
  spotifyUrl: string;
  trackCount: number;
  followers: number;
  owner: {
    id: string;
    name: string;
    spotifyUrl: string;
  };
  isPublic: boolean;
  snapshotId: string;
  // Derived/enriched fields
  tracks?: PlaylistTrack[];
  // AI-generated
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  mood: string;
  moodBadge: string; // short label e.g. "Melankoli"
  listeningContext: string;
  personality: string;
  emotionalTone: string;
  styleImpression: string;
  poeticReview: string; // full editorial paragraph
  generatedAt: string;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // unix ms
  oauthState?: string;
  user?: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: string;
  code?: "UNAUTHORIZED" | "RATE_LIMITED" | "NOT_FOUND" | "SERVER_ERROR";
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── AI Chat ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export type SortKey = "default" | "name" | "tracks" | "followers";
export type ViewMode = "grid" | "list";

export interface FilterState {
  search: string;
  sort: SortKey;
  view: ViewMode;
}
