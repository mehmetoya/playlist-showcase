import { NextResponse } from "next/server";
import { requireAuth, spotifyErrorResponse } from "@/lib/auth-guard";
import { getPlaylistTracks } from "@/lib/spotify";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  try {
    const tracks = await getPlaylistTracks(auth.accessToken, params.id, limit);
    return NextResponse.json({ data: tracks });
  } catch (err) {
    console.error(`GET /api/playlists/${params.id}/tracks:`, err);
    return spotifyErrorResponse(err);
  }
}
