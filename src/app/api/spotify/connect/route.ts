import { NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/music-service";
import {
  SPOTIFY_STATE_COOKIE,
  createSpotifyAuthorizeUrl,
  getCookieOptions,
} from "@/lib/spotify";
import { hasSpotifyEnv } from "@/lib/env";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const homeUrl = new URL("/", origin);

  if (!hasSpotifyEnv()) {
    return NextResponse.redirect(homeUrl);
  }

  const viewer = await getCurrentViewer();

  if (!viewer.user || viewer.isDemoMode || !viewer.hasDatabase) {
    return NextResponse.redirect(homeUrl);
  }

  const state = crypto.randomUUID();
  const authorizeUrl = createSpotifyAuthorizeUrl(origin, state);
  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set(SPOTIFY_STATE_COOKIE, state, getCookieOptions(60 * 10));

  return response;
}
