import { NextResponse } from "next/server";
import { getSession, isTokenExpired } from "@/lib/session";
import { refreshAccessToken } from "@/lib/spotify";

export async function GET() {
  const session = await getSession();

  if (!session.accessToken || !session.user) {
    return NextResponse.json({ user: null });
  }

  // Auto-refresh token if expired
  if (session.expiresAt && isTokenExpired(session.expiresAt) && session.refreshToken) {
    try {
      const tokens = await refreshAccessToken(session.refreshToken);
      session.accessToken = tokens.access_token;
      session.expiresAt = Date.now() + tokens.expires_in * 1000;
      if (tokens.refresh_token) session.refreshToken = tokens.refresh_token;
      await session.save();
    } catch {
      session.destroy();
      return NextResponse.json({ user: null });
    }
  }

  return NextResponse.json({ user: session.user });
}
