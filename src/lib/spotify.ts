import { cookies } from "next/headers";

import {
  getSpotifyClientId,
  getSpotifyClientSecret,
  hasSpotifyEnv,
} from "@/lib/env";
import type {
  SpotifyImportState,
  SpotifyPlaylistSummary,
} from "@/lib/types";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com";
const SPOTIFY_STATE_COOKIE = "spotify_oauth_state";
const SPOTIFY_ACCESS_COOKIE = "spotify_access_token";
const SPOTIFY_REFRESH_COOKIE = "spotify_refresh_token";
const SPOTIFY_EXPIRES_COOKIE = "spotify_access_expires_at";
const SPOTIFY_SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
];

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

type SpotifyPlaylistsResponse = {
  items: Array<{
    id: string;
    name: string;
    description: string | null;
    owner: {
      display_name: string | null;
    };
    tracks: {
      total: number;
    };
    external_urls: {
      spotify: string;
    };
  }>;
};

type SpotifyPlaylistDetailResponse = {
  id: string;
  name: string;
  description: string | null;
  external_urls: {
    spotify: string;
  };
};

type SpotifyPlaylistTracksResponse = {
  items: Array<{
    is_local?: boolean;
    track: {
      type?: string;
      name: string;
      album: {
        name: string;
      };
      artists: Array<{
        name: string;
      }>;
    } | null;
  }>;
  next: string | null;
};

export type SpotifyImportTrack = {
  title: string;
  albumTitle: string;
  artists: string[];
};

export type SpotifyPlaylistImportBundle = {
  playlist: {
    id: string;
    name: string;
    description: string | null;
    externalUrl: string;
  };
  tracks: SpotifyImportTrack[];
};

function getCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  };
}

function mapSpotifyPlaylist(
  playlist: SpotifyPlaylistsResponse["items"][number],
): SpotifyPlaylistSummary {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    ownerName: playlist.owner.display_name ?? "Spotify",
    trackCount: playlist.tracks.total,
    externalUrl: playlist.external_urls.spotify,
  };
}

async function fetchSpotifyJson<T>(accessToken: string, pathOrUrl: string) {
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${SPOTIFY_API_BASE}${pathOrUrl}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let message = "Spotify request failed.";

    try {
      const payload = (await response.json()) as {
        error?: { message?: string } | string;
        message?: string;
      };

      if (
        payload.error &&
        typeof payload.error === "object" &&
        payload.error.message
      ) {
        message = payload.error.message;
      } else if (typeof payload.error === "string") {
        message = payload.error;
      } else if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Ignore JSON parsing failures and surface the generic message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function createSpotifyAuthorizeUrl(origin: string, state: string) {
  const url = new URL("/authorize", SPOTIFY_ACCOUNTS_BASE);
  url.searchParams.set("client_id", getSpotifyClientId());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${origin}/api/spotify/callback`);
  url.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("show_dialog", "true");

  return url;
}

export async function exchangeSpotifyCode(
  code: string,
  redirectUri: string,
): Promise<SpotifyTokenResponse> {
  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${getSpotifyClientId()}:${getSpotifyClientSecret()}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Could not connect Spotify.");
  }

  return (await response.json()) as SpotifyTokenResponse;
}

export async function refreshSpotifyAccessToken(refreshToken: string) {
  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${getSpotifyClientId()}:${getSpotifyClientSecret()}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Could not refresh Spotify access.");
  }

  return (await response.json()) as SpotifyTokenResponse;
}

export async function persistSpotifyTokens(tokenResponse: SpotifyTokenResponse) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

  cookieStore.set(
    SPOTIFY_ACCESS_COOKIE,
    tokenResponse.access_token,
    getCookieOptions(tokenResponse.expires_in),
  );

  if (tokenResponse.refresh_token) {
    cookieStore.set(
      SPOTIFY_REFRESH_COOKIE,
      tokenResponse.refresh_token,
      getCookieOptions(60 * 60 * 24 * 30),
    );
  }

  cookieStore.set(
    SPOTIFY_EXPIRES_COOKIE,
    String(expiresAt),
    getCookieOptions(60 * 60 * 24 * 30),
  );
}

export async function clearSpotifySession() {
  const cookieStore = await cookies();

  cookieStore.delete(SPOTIFY_ACCESS_COOKIE);
  cookieStore.delete(SPOTIFY_REFRESH_COOKIE);
  cookieStore.delete(SPOTIFY_EXPIRES_COOKIE);
  cookieStore.delete(SPOTIFY_STATE_COOKIE);
}

export async function getSpotifyOAuthStateCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SPOTIFY_STATE_COOKIE)?.value ?? null;
}

export async function setSpotifyOAuthStateCookie(state: string) {
  const cookieStore = await cookies();
  cookieStore.set(SPOTIFY_STATE_COOKIE, state, getCookieOptions(60 * 10));
}

async function getSpotifyAccessToken(options?: { canRefresh?: boolean }) {
  if (!hasSpotifyEnv()) {
    return null;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SPOTIFY_ACCESS_COOKIE)?.value ?? null;
  const refreshToken = cookieStore.get(SPOTIFY_REFRESH_COOKIE)?.value ?? null;
  const expiresAt = Number(
    cookieStore.get(SPOTIFY_EXPIRES_COOKIE)?.value ?? 0,
  );

  if (accessToken && Date.now() < expiresAt - 30_000) {
    return accessToken;
  }

  if (!options?.canRefresh || !refreshToken) {
    return null;
  }

  const refreshed = await refreshSpotifyAccessToken(refreshToken);
  await persistSpotifyTokens({
    ...refreshed,
    refresh_token: refreshed.refresh_token ?? refreshToken,
  });

  return refreshed.access_token;
}

export async function getSpotifyImportState(): Promise<SpotifyImportState> {
  if (!hasSpotifyEnv()) {
    return {
      available: false,
      connected: false,
      playlists: [],
    };
  }

  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) {
    return {
      available: true,
      connected: false,
      playlists: [],
    };
  }

  try {
    const response = await fetchSpotifyJson<SpotifyPlaylistsResponse>(
      accessToken,
      "/me/playlists?limit=8",
    );

    return {
      available: true,
      connected: true,
      playlists: response.items.map(mapSpotifyPlaylist),
    };
  } catch {
    return {
      available: true,
      connected: false,
      playlists: [],
    };
  }
}

export async function getSpotifyPlaylistImportBundle(
  spotifyPlaylistId: string,
): Promise<SpotifyPlaylistImportBundle> {
  const accessToken = await getSpotifyAccessToken({ canRefresh: true });

  if (!accessToken) {
    throw new Error("Connect Spotify before importing playlists.");
  }

  const playlist = await fetchSpotifyJson<SpotifyPlaylistDetailResponse>(
    accessToken,
    `/playlists/${spotifyPlaylistId}?fields=id,name,description,external_urls.spotify`,
  );

  const tracks: SpotifyImportTrack[] = [];
  let nextUrl =
    `${SPOTIFY_API_BASE}/playlists/${spotifyPlaylistId}/tracks` +
    "?limit=100&fields=items(is_local,track(name,type,album(name),artists(name))),next";

  while (nextUrl) {
    const page = await fetchSpotifyJson<SpotifyPlaylistTracksResponse>(
      accessToken,
      nextUrl,
    );

    page.items.forEach((item) => {
      if (item.is_local || !item.track || item.track.type !== "track") {
        return;
      }

      tracks.push({
        title: item.track.name,
        albumTitle: item.track.album.name,
        artists: item.track.artists.map((artist) => artist.name),
      });
    });

    nextUrl = page.next ?? "";
  }

  return {
    playlist: {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      externalUrl: playlist.external_urls.spotify,
    },
    tracks,
  };
}

export {
  SPOTIFY_ACCESS_COOKIE,
  SPOTIFY_EXPIRES_COOKIE,
  SPOTIFY_REFRESH_COOKIE,
  SPOTIFY_SCOPES,
  SPOTIFY_STATE_COOKIE,
  getCookieOptions,
};
