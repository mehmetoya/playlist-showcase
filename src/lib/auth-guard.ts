import { NextResponse } from "next/server";
import { getSession, isTokenExpired } from "@/lib/session";
import {
  refreshAccessToken,
  SpotifyUnauthorizedError,
  SpotifyRateLimitError,
  SpotifyNotFoundError,
} from "@/lib/spotify";
import type { IronSession } from "iron-session";
import type { SessionData } from "@/types";

export interface AuthedSession {
  session: IronSession<SessionData>;
  accessToken: string;
  userId: string;
}

export async function requireAuth(): Promise<AuthedSession | NextResponse> {
  const session = await getSession();

  if (!session.accessToken || !session.refreshToken || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized — please log in", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  if (session.expiresAt && isTokenExpired(session.expiresAt)) {
    try {
      const tokens = await refreshAccessToken(session.refreshToken);
      session.accessToken = tokens.access_token;
      session.expiresAt = Date.now() + tokens.expires_in * 1000;
      if (tokens.refresh_token) session.refreshToken = tokens.refresh_token;
      await session.save();
    } catch {
      session.destroy();
      return NextResponse.json(
        { error: "Session expired — please log in again", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
  }

  return { session, accessToken: session.accessToken, userId: session.user.id };
}

// Shared Spotify error → NextResponse mapper used by all route handlers.
// Uses statically imported error classes — no dynamic require, full type inference.
export function spotifyErrorResponse(err: unknown): NextResponse {
  if (err instanceof SpotifyUnauthorizedError) {
    return NextResponse.json(
      { error: "Spotify session expired — please reconnect", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }
  if (err instanceof SpotifyRateLimitError) {
    return NextResponse.json(
      { error: "Spotify rate limit hit — please try again shortly", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(err.retryAfter) } }
    );
  }
  if (err instanceof SpotifyNotFoundError) {
    return NextResponse.json(
      { error: "Playlist not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }
  return NextResponse.json(
    { error: "An unexpected error occurred", code: "SERVER_ERROR" },
    { status: 500 }
  );
}
