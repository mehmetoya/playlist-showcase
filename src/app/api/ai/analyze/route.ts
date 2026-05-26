import { NextRequest, NextResponse } from "next/server";
import { requireAuth, spotifyErrorResponse } from "@/lib/auth-guard";
import { getPlaylistById, getPlaylistTracks } from "@/lib/spotify";
import { analyzePlaylist } from "@/lib/claude";
import { checkRateLimit, getCachedAnalysis, setCachedAnalysis } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  const { playlistId } = body as { playlistId?: string };

  if (!playlistId) {
    return NextResponse.json({ error: "playlistId is required" }, { status: 400 });
  }

  try {
    // Fix 2: Cache check comes FIRST — a cache hit skips rate-limit consumption entirely.
    // We need the snapshotId to form the cache key, so fetch playlist metadata first.
    // This is a lightweight call (no track data) and is itself ISR-cached for 5 minutes.
    const playlist = await getPlaylistById(auth.accessToken, playlistId);
    const cached = getCachedAnalysis(playlistId, playlist.snapshotId);

    if (cached) {
      return NextResponse.json(
        { data: cached },
        { headers: { "X-Cache": "HIT" } }
      );
    }

    // Cache miss — now check rate limit before hitting the AI API
    const rl = checkRateLimit(auth.userId, "analyze");
    if (!rl.allowed) {
      const resetMins = Math.ceil(rl.resetInMs / 60_000);
      return NextResponse.json(
        { error: `Analysis limit reached. Resets in ${resetMins} minute(s).`, code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
      );
    }

    const tracks = await getPlaylistTracks(auth.accessToken, playlistId, 50);
    const analysis = await analyzePlaylist(playlist, tracks);

    // Persist in cache — auto-invalidated when snapshotId changes (playlist edited)
    setCachedAnalysis(playlistId, playlist.snapshotId, analysis);

    return NextResponse.json(
      { data: analysis },
      { headers: { "X-Cache": "MISS", "X-RateLimit-Remaining": String(rl.remaining) } }
    );
  } catch (err) {
    console.error("POST /api/ai/analyze:", err);
    return spotifyErrorResponse(err);
  }
}
