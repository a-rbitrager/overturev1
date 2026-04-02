import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  SPOTIFY_ACCESS_COOKIE,
  SPOTIFY_EXPIRES_COOKIE,
  SPOTIFY_REFRESH_COOKIE,
  SPOTIFY_STATE_COOKIE,
  exchangeSpotifyCode,
  getCookieOptions,
} from "@/lib/spotify";
import { hasSpotifyEnv } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get(SPOTIFY_STATE_COOKIE)?.value ?? null;
  const redirectUrl = new URL("/", url.origin);

  if (!hasSpotifyEnv() || !code || !state || savedState !== state) {
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(SPOTIFY_STATE_COOKIE);
    return response;
  }

  try {
    const tokenResponse = await exchangeSpotifyCode(
      code,
      `${url.origin}/api/spotify/callback`,
    );
    const response = NextResponse.redirect(redirectUrl);
    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

    response.cookies.set(
      SPOTIFY_ACCESS_COOKIE,
      tokenResponse.access_token,
      getCookieOptions(tokenResponse.expires_in),
    );

    if (tokenResponse.refresh_token) {
      response.cookies.set(
        SPOTIFY_REFRESH_COOKIE,
        tokenResponse.refresh_token,
        getCookieOptions(60 * 60 * 24 * 30),
      );
    }

    response.cookies.set(
      SPOTIFY_EXPIRES_COOKIE,
      String(expiresAt),
      getCookieOptions(60 * 60 * 24 * 30),
    );
    response.cookies.delete(SPOTIFY_STATE_COOKIE);

    return response;
  } catch {
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(SPOTIFY_STATE_COOKIE);
    response.cookies.delete(SPOTIFY_ACCESS_COOKIE);
    response.cookies.delete(SPOTIFY_REFRESH_COOKIE);
    response.cookies.delete(SPOTIFY_EXPIRES_COOKIE);
    return response;
  }
}
