import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "@/types";

export const sessionOptions: SessionOptions = {
  cookieName: "playlist_showcase_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export function isTokenExpired(expiresAt: number): boolean {
  // Consider expired 60s before actual expiry for safety margin
  return Date.now() > expiresAt - 60_000;
}
