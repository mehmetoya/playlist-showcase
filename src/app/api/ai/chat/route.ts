import { NextRequest, NextResponse } from "next/server";
import { requireAuth, spotifyErrorResponse } from "@/lib/auth-guard";
import { getPlaylistById, getPlaylistTracks } from "@/lib/spotify";
import { chatAboutPlaylist } from "@/lib/claude";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  // Fix 4: Rate limit — 40 chat messages per user per hour
  const rl = checkRateLimit(auth.userId, "chat");
  if (!rl.allowed) {
    const resetMins = Math.ceil(rl.resetInMs / 60_000);
    return NextResponse.json(
      { error: `Chat limit reached. Resets in ${resetMins} minute(s).`, code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { playlistId, messages, userMessage } = body as {
    playlistId?: string;
    messages?: ChatMessage[];
    userMessage?: string;
  };

  if (!playlistId || !userMessage?.trim()) {
    return NextResponse.json(
      { error: "playlistId and userMessage are required" },
      { status: 400 }
    );
  }

  // Guard against absurdly long inputs
  if (userMessage.length > 500) {
    return NextResponse.json({ error: "Message too long (max 500 chars)" }, { status: 400 });
  }

  try {
    const [playlist, tracks] = await Promise.all([
      getPlaylistById(auth.accessToken, playlistId),
      getPlaylistTracks(auth.accessToken, playlistId, 30),
    ]);

    const reply = await chatAboutPlaylist(playlist, tracks, messages ?? [], userMessage);
    return NextResponse.json(
      { data: { reply } },
      { headers: { "X-RateLimit-Remaining": String(rl.remaining) } }
    );
  } catch (err) {
    console.error("POST /api/ai/chat:", err);
    return spotifyErrorResponse(err);
  }
}
