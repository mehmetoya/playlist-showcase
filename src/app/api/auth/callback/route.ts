import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getSpotifyUser } from "@/lib/spotify";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appUrl}/?error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/?error=missing_params`);
  }

  const session = await getSession();
  const storedState = session.oauthState;

  if (state !== storedState) {
    return NextResponse.redirect(`${appUrl}/?error=state_mismatch`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.expiresAt = Date.now() + tokens.expires_in * 1000;

    // Fetch and store user info
    session.user = await getSpotifyUser(tokens.access_token);

    await session.save();

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/?error=auth_failed`);
  }
}
