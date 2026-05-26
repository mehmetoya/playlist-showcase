import { NextResponse } from "next/server";
import { requireAuth, spotifyErrorResponse } from "@/lib/auth-guard";
import { getPlaylistById } from "@/lib/spotify";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const playlist = await getPlaylistById(auth.accessToken, params.id);
    return NextResponse.json({ data: playlist });
  } catch (err) {
    console.error(`GET /api/playlists/${params.id}:`, err);
    return spotifyErrorResponse(err);
  }
}
