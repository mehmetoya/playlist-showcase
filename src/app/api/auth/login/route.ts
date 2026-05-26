import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/spotify";
import { getSession } from "@/lib/session";
import { generateState } from "@/lib/utils";

export async function GET() {
  const state = generateState();

  // Store state in session to verify on callback
  const session = await getSession();
 session.oauthState = state; 
  await session.save();

  const url = getAuthorizationUrl(state);
  return NextResponse.redirect(url);
}
