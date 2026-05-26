import type {
  Playlist,
  PlaylistTrack,
  SpotifyPlaylistRaw,
  SpotifyPlaylistsResponse,
  SpotifyTracksResponse,
  SpotifyTrackObject,
  SessionData,
} from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPOTIFY_BASE = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com";
const SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-private",
  "user-read-email",
].join(" ");

// ─── Auth URLs ────────────────────────────────────────────────────────────────

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    state,
    show_dialog: "false",
  });
  return `${SPOTIFY_ACCOUNTS}/authorize?${params}`;
}

// ─── Token exchange ───────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
  });

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body,
  });

  if (!res.ok) throw new Error("Failed to refresh token");
  return res.json();
}

// ─── Authenticated fetcher ────────────────────────────────────────────────────

// Fix 7: Typed error classes so callers can distinguish Spotify error scenarios
// precisely instead of parsing strings.
export class SpotifyUnauthorizedError extends Error {
  constructor() { super("Spotify token expired or invalid"); this.name = "SpotifyUnauthorizedError"; }
}
export class SpotifyRateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super(`Spotify rate limited — retry after ${retryAfter}s`);
    this.name = "SpotifyRateLimitError";
    this.retryAfter = retryAfter;
  }
}
export class SpotifyNotFoundError extends Error {
  constructor(path: string) { super(`Spotify resource not found: ${path}`); this.name = "SpotifyNotFoundError"; }
}
export class SpotifyApiError extends Error {
  status: number;
  constructor(status: number, path: string) {
    super(`Spotify API error ${status} for ${path}`);
    this.name = "SpotifyApiError";
    this.status = status;
  }
}

async function spotifyFetch<T>(
  path: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${SPOTIFY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    next: { revalidate: 300 },
  });

  if (res.status === 401) throw new SpotifyUnauthorizedError();
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "5");
    throw new SpotifyRateLimitError(retryAfter);
  }
  if (res.status === 404) throw new SpotifyNotFoundError(path);
  if (!res.ok) throw new SpotifyApiError(res.status, path);

  return res.json();
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getSpotifyUser(accessToken: string): Promise<SessionData["user"]> {
  const data = await spotifyFetch<{
    id: string;
    display_name: string | null;
    images: Array<{ url: string }>;
  }>("/me", accessToken);

  return {
    id: data.id,
    name: data.display_name ?? data.id,
    imageUrl: data.images?.[0]?.url ?? null,
  };
}

// ─── Playlists ────────────────────────────────────────────────────────────────

// Fix 2: Iterative pagination — fetches ALL pages, not just the first 50.
// Spotify caps limit at 50 per request; we loop until `next` is null.
export async function getUserPlaylists(accessToken: string): Promise<Playlist[]> {
  const all: Playlist[] = [];
  let url: string | null = `/me/playlists?limit=50&offset=0`;

  while (url) {
    // spotifyFetch prepends SPOTIFY_BASE, so strip it if present
    const path: string = url.startsWith("https://")
  ? url.replace("https://api.spotify.com/v1", "")
  : url;

    const data = await spotifyFetch<SpotifyPlaylistsResponse>(path, accessToken);
    all.push(...data.items.map(normalizePlaylist));
    url = data.next; // null when last page reached
  }

  return all;
}

export async function getPlaylistById(
  accessToken: string,
  id: string
): Promise<Playlist> {
  const data = await spotifyFetch<SpotifyPlaylistRaw>(
    `/playlists/${id}?fields=id,name,description,images,external_urls,tracks(total),followers,owner,public,snapshot_id`,
    accessToken
  );
  return normalizePlaylist(data);
}

export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string,
  limit = 50
): Promise<PlaylistTrack[]> {
  const data = await spotifyFetch<SpotifyTracksResponse>(
    `/playlists/${playlistId}/tracks?limit=${limit}&fields=items(added_at,track(id,name,artists,album(name,images),duration_ms,external_urls,preview_url))`,
    accessToken
  );

  return data.items
    .filter((item) => item.track !== null)
    .map((item) => normalizeTrack(item.track!, item.added_at));
}

// ─── Normalisers ──────────────────────────────────────────────────────────────

function normalizePlaylist(raw: SpotifyPlaylistRaw): Playlist {
  const cover =
    raw.images?.find((img) => img.width && img.width >= 300)?.url ??
    raw.images?.[0]?.url ??
    null;

  return {
    id: raw.id,
    name: raw.name,
    // Fix 6: sanitize description — strip HTML tags first, then decode entities.
    // Spotify sometimes returns descriptions with <a href="..."> links or <b> tags.
    description: sanitizeDescription(raw.description ?? ""),
    coverUrl: cover,
    spotifyUrl: raw.external_urls.spotify,
    trackCount: raw.tracks.total,
    followers: raw.followers?.total ?? 0,
    owner: {
      id: raw.owner.id,
      name: raw.owner.display_name ?? raw.owner.id,
      spotifyUrl: raw.owner.external_urls.spotify,
    },
    isPublic: raw.public ?? false,
    snapshotId: raw.snapshot_id,
  };
}

function normalizeTrack(
  raw: SpotifyTrackObject,
  addedAt: string | null
): PlaylistTrack {
  const albumCover =
    raw.album.images?.find((img) => img.width && img.width >= 300)?.url ??
    raw.album.images?.[0]?.url ??
    null;

  return {
    id: raw.id,
    name: raw.name,
    artists: raw.artists.map((a) => a.name),
    albumName: raw.album.name,
    albumCover,
    durationMs: raw.duration_ms,
    spotifyUrl: raw.external_urls.spotify,
    previewUrl: raw.preview_url,
    addedAt,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Fix 6: Two-step sanitization pipeline:
// 1. Strip all HTML tags (Spotify uses <a>, <b>, <br> in some descriptions)
// 2. Decode remaining HTML entities
function sanitizeDescription(raw: string): string {
  const stripped = raw.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
  return decodeHtmlEntities(stripped);
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return `${hours}s ${minutes}dk`;
  return `${minutes}dk`;
}

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}B`;
  return String(n);
}
