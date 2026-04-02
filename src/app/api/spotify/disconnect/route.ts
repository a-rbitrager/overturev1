import { NextResponse } from "next/server";

import {
  SPOTIFY_ACCESS_COOKIE,
  SPOTIFY_EXPIRES_COOKIE,
  SPOTIFY_REFRESH_COOKIE,
  SPOTIFY_STATE_COOKIE,
} from "@/lib/spotify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", url.origin));

  response.cookies.delete(SPOTIFY_STATE_COOKIE);
  response.cookies.delete(SPOTIFY_ACCESS_COOKIE);
  response.cookies.delete(SPOTIFY_REFRESH_COOKIE);
  response.cookies.delete(SPOTIFY_EXPIRES_COOKIE);

  return response;
}
