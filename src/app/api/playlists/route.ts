import { NextResponse } from "next/server";
import { requireAuth, spotifyErrorResponse } from "@/lib/auth-guard";
import { getUserPlaylists } from "@/lib/spotify";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const playlists = await getUserPlaylists(auth.accessToken);
    return NextResponse.json({ data: playlists });
  } catch (err) {
    console.error("GET /api/playlists:", err);
    return spotifyErrorResponse(err);
  }
}
