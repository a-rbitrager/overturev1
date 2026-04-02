import { Prisma } from "@prisma/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { cache } from "react";

import {
  DEMO_VIEWER,
  mockAlbums,
  mockArtists,
  mockPlaylists,
  mockTracks,
} from "@/lib/data/mock-catalog";
import { hasDatabaseEnv, hasSupabaseEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getSpotifyPlaylistImportBundle } from "@/lib/spotify";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AlbumDetail,
  AlbumSummary,
  ArtistDetail,
  ArtistSummary,
  HomeData,
  PlaylistDetail,
  PlaylistSummary,
  SearchResults,
  SpotifyImportResult,
  TrackSummary,
  Viewer,
  ViewerState,
} from "@/lib/types";
import {
  playlistDeleteSchema,
  playlistSchema,
  playlistTrackRemoveSchema,
  playlistTrackSchema,
  spotifyImportSchema,
} from "@/lib/validators";

function deriveNameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Listener";
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildViewerFromAuth(user: SupabaseUser): Viewer {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawName = metadata.full_name ?? metadata.name ?? deriveNameFromEmail(user.email ?? "");
  const name = titleCase(String(rawName));

  return {
    id: user.id,
    email: user.email ?? "",
    name,
    avatarUrl:
      typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
  };
}

export async function ensureViewerRecord(user: SupabaseUser) {
  if (!hasDatabaseEnv() || !user.email) {
    return buildViewerFromAuth(user);
  }

  const viewer = buildViewerFromAuth(user);

  try {
    const savedUser = await prisma.user.upsert({
      where: { id: viewer.id },
      update: {
        email: viewer.email,
        name: viewer.name,
        avatarUrl: viewer.avatarUrl,
      },
      create: {
        id: viewer.id,
        email: viewer.email,
        name: viewer.name,
        avatarUrl: viewer.avatarUrl,
      },
    });

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      avatarUrl: savedUser.avatarUrl,
    } satisfies Viewer;
  } catch (error) {
    console.error("Failed to sync authenticated user to Prisma.", error);
    return viewer;
  }
}

export const getCurrentViewer = cache(async (): Promise<ViewerState> => {
  const hasSupabase = hasSupabaseEnv();
  const hasDatabase = hasDatabaseEnv();

  if (!hasSupabase) {
    return {
      user: DEMO_VIEWER,
      hasSupabase: false,
      hasDatabase: false,
      isDemoMode: true,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return {
        user: null,
        hasSupabase,
        hasDatabase,
        isDemoMode: false,
      };
    }

    return {
      user: await ensureViewerRecord(user),
      hasSupabase,
      hasDatabase,
      isDemoMode: false,
    };
  } catch (error) {
    console.error("Failed to resolve the current viewer.", error);

    return {
      user: null,
      hasSupabase,
      hasDatabase,
      isDemoMode: false,
    };
  }
});

function mapMockArtist(artistId: string): ArtistSummary {
  const artist = mockArtists.find((item) => item.id === artistId);

  if (!artist) {
    throw new Error(`Unknown mock artist: ${artistId}`);
  }

  return {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.imageUrl,
    albumCount: mockAlbums.filter((album) => album.artistId === artist.id).length,
  };
}

function mapMockAlbum(albumId: string): AlbumSummary {
  const album = mockAlbums.find((item) => item.id === albumId);

  if (!album) {
    throw new Error(`Unknown mock album: ${albumId}`);
  }

  const artist = mapMockArtist(album.artistId);

  return {
    id: album.id,
    title: album.title,
    coverUrl: album.coverUrl,
    releaseYear: album.releaseYear,
    trackCount: mockTracks.filter((track) => track.albumId === album.id).length,
    artist: {
      id: artist.id,
      name: artist.name,
    },
  };
}

function mapMockTrack(
  trackId: string,
  options?: {
    queueId?: string;
    playlistTrackId?: string;
  },
): TrackSummary {
  const track = mockTracks.find((item) => item.id === trackId);

  if (!track) {
    throw new Error(`Unknown mock track: ${trackId}`);
  }

  const album = mapMockAlbum(track.albumId);
  const artist = mapMockArtist(
    mockAlbums.find((item) => item.id === track.albumId)?.artistId ?? "",
  );

  return {
    queueId: options?.queueId ?? track.id,
    playlistTrackId: options?.playlistTrackId,
    id: track.id,
    title: track.title,
    duration: track.duration,
    audioUrl: track.audioUrl,
    album: {
      id: album.id,
      title: album.title,
      coverUrl: album.coverUrl,
      releaseYear: album.releaseYear,
    },
    artist: {
      id: artist.id,
      name: artist.name,
      imageUrl: artist.imageUrl,
    },
  };
}

function mapMockPlaylist(playlistId: string): PlaylistDetail {
  const playlist = mockPlaylists.find((item) => item.id === playlistId);

  if (!playlist) {
    throw new Error(`Unknown mock playlist: ${playlistId}`);
  }

  const tracks = playlist.trackIds.map((trackId, index) =>
    mapMockTrack(trackId, {
      queueId: `${playlist.id}:${index}`,
      playlistTrackId: `${playlist.id}:${index}`,
    }),
  );
  const totalDuration = tracks.reduce((sum, track) => sum + track.duration, 0);

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    coverUrl: playlist.coverUrl,
    isPublic: playlist.isPublic,
    trackCount: tracks.length,
    totalDuration,
    user: {
      id: DEMO_VIEWER.id,
      name: DEMO_VIEWER.name,
      avatarUrl: DEMO_VIEWER.avatarUrl,
    },
    tracks,
  };
}

function mapPlaylistSummaryFromDetail(detail: PlaylistDetail): PlaylistSummary {
  return {
    id: detail.id,
    name: detail.name,
    description: detail.description,
    coverUrl: detail.coverUrl,
    isPublic: detail.isPublic,
    trackCount: detail.trackCount,
    totalDuration: detail.totalDuration,
    user: detail.user,
  };
}

function searchMockCatalog(query: string): SearchResults {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return {
      artists: [],
      albums: [],
      tracks: [],
    };
  }

  return {
    artists: mockArtists
      .filter((artist) => artist.name.toLowerCase().includes(normalized))
      .map((artist) => mapMockArtist(artist.id)),
    albums: mockAlbums
      .filter(
        (album) =>
          album.title.toLowerCase().includes(normalized) ||
          mapMockArtist(album.artistId).name.toLowerCase().includes(normalized),
      )
      .map((album) => mapMockAlbum(album.id)),
    tracks: mockTracks
      .filter((track) => track.title.toLowerCase().includes(normalized))
      .map((track) => mapMockTrack(track.id)),
  };
}

async function withDatabaseFallback<T>(
  fallback: T,
  query: () => Promise<T>,
): Promise<T> {
  if (!hasDatabaseEnv()) {
    return fallback;
  }

  try {
    return await query();
  } catch (error) {
    console.error("Database read failed. Falling back to demo catalog.", error);
    return fallback;
  }
}

function mapDatabaseAlbum(album: {
  id: string;
  title: string;
  coverUrl: string;
  releaseYear: number;
  artist: { id: string; name: string };
  _count: { tracks: number };
}): AlbumSummary {
  return {
    id: album.id,
    title: album.title,
    coverUrl: album.coverUrl,
    releaseYear: album.releaseYear,
    trackCount: album._count.tracks,
    artist: {
      id: album.artist.id,
      name: album.artist.name,
    },
  };
}

function mapDatabaseArtist(artist: {
  id: string;
  name: string;
  imageUrl: string | null;
  _count: { albums: number };
}): ArtistSummary {
  return {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.imageUrl,
    albumCount: artist._count.albums,
  };
}

function mapDatabaseTrack(
  track: {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  album: {
    id: string;
    title: string;
    coverUrl: string;
    releaseYear: number;
    artist: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
  };
},
  options?: {
    queueId?: string;
    playlistTrackId?: string;
  },
): TrackSummary {
  return {
    queueId: options?.queueId ?? track.id,
    playlistTrackId: options?.playlistTrackId,
    id: track.id,
    title: track.title,
    duration: track.duration,
    audioUrl: track.audioUrl,
    album: {
      id: track.album.id,
      title: track.album.title,
      coverUrl: track.album.coverUrl,
      releaseYear: track.album.releaseYear,
    },
    artist: {
      id: track.album.artist.id,
      name: track.album.artist.name,
      imageUrl: track.album.artist.imageUrl,
    },
  };
}

function mapDatabasePlaylist(playlist: {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  tracks: Array<{
    id: string;
    position: number;
    track: {
      id: string;
      title: string;
      duration: number;
      audioUrl: string;
      album: {
        id: string;
        title: string;
        coverUrl: string;
        releaseYear: number;
        artist: {
          id: string;
          name: string;
          imageUrl: string | null;
        };
      };
    };
  }>;
}): PlaylistDetail {
  const tracks = playlist.tracks.map((item) =>
    mapDatabaseTrack(item.track, {
      queueId: item.id,
      playlistTrackId: item.id,
    }),
  );
  const totalDuration = tracks.reduce((sum, track) => sum + track.duration, 0);

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    coverUrl: playlist.coverUrl,
    isPublic: playlist.isPublic,
    trackCount: tracks.length,
    totalDuration,
    user: playlist.user,
    tracks,
  };
}

export async function getFeaturedArtists() {
  return withDatabaseFallback(
    mockArtists.map((artist) => mapMockArtist(artist.id)),
    async () => {
      const artists = await prisma.artist.findMany({
        take: 4,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              albums: true,
            },
          },
        },
      });

      return artists.map(mapDatabaseArtist);
    },
  );
}

export async function getFeaturedAlbums() {
  return withDatabaseFallback(
    mockAlbums.map((album) => mapMockAlbum(album.id)),
    async () => {
      const albums = await prisma.album.findMany({
        take: 6,
        orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
        include: {
          artist: true,
          _count: {
            select: {
              tracks: true,
            },
          },
        },
      });

      return albums.map(mapDatabaseAlbum);
    },
  );
}

export async function getTrendingTracks() {
  return withDatabaseFallback(
    mockTracks.map((track) => mapMockTrack(track.id)),
    async () => {
      const tracks = await prisma.track.findMany({
        take: 8,
        orderBy: { title: "asc" },
        include: {
          album: {
            include: {
              artist: true,
            },
          },
        },
      });

      return tracks.map((track) => mapDatabaseTrack(track));
    },
  );
}

export async function searchCatalog(query: string) {
  return withDatabaseFallback(searchMockCatalog(query), async () => {
    const normalized = query.trim();

    if (!normalized) {
      return {
        artists: [],
        albums: [],
        tracks: [],
      } satisfies SearchResults;
    }

    const [artists, albums, tracks] = await Promise.all([
      prisma.artist.findMany({
        where: {
          name: {
            contains: normalized,
            mode: "insensitive",
          },
        },
        take: 6,
        include: {
          _count: {
            select: {
              albums: true,
            },
          },
        },
      }),
      prisma.album.findMany({
        where: {
          OR: [
            {
              title: {
                contains: normalized,
                mode: "insensitive",
              },
            },
            {
              artist: {
                name: {
                  contains: normalized,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
        take: 8,
        include: {
          artist: true,
          _count: {
            select: {
              tracks: true,
            },
          },
        },
      }),
      prisma.track.findMany({
        where: {
          title: {
            contains: normalized,
            mode: "insensitive",
          },
        },
        take: 10,
        include: {
          album: {
            include: {
              artist: true,
            },
          },
        },
      }),
    ]);

    return {
      artists: artists.map(mapDatabaseArtist),
      albums: albums.map(mapDatabaseAlbum),
        tracks: tracks.map((track) => mapDatabaseTrack(track)),
    } satisfies SearchResults;
  });
}

export async function getHomeData(query: string): Promise<HomeData> {
  const [featuredArtists, featuredAlbums, trendingTracks, searchResults] =
    await Promise.all([
      getFeaturedArtists(),
      getFeaturedAlbums(),
      getTrendingTracks(),
      searchCatalog(query),
    ]);

  return {
    featuredArtists,
    featuredAlbums,
    trendingTracks,
    searchResults,
  };
}

export async function getArtistAlbums(artistId: string) {
  return withDatabaseFallback(
    mockAlbums
      .filter((album) => album.artistId === artistId)
      .map((album) => mapMockAlbum(album.id)),
    async () => {
      const albums = await prisma.album.findMany({
        where: { artistId },
        orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
        include: {
          artist: true,
          _count: {
            select: {
              tracks: true,
            },
          },
        },
      });

      return albums.map(mapDatabaseAlbum);
    },
  );
}

export async function getArtistDetail(
  artistId: string,
): Promise<ArtistDetail | null> {
  return withDatabaseFallback(
    mockArtists.some((artist) => artist.id === artistId)
      ? {
          artist: mapMockArtist(artistId),
          albums: mockAlbums
            .filter((album) => album.artistId === artistId)
            .map((album) => mapMockAlbum(album.id)),
        }
      : null,
    async () => {
      const artist = await prisma.artist.findUnique({
        where: { id: artistId },
        include: {
          _count: {
            select: {
              albums: true,
            },
          },
          albums: {
            orderBy: [{ releaseYear: "desc" }, { title: "asc" }],
            include: {
              artist: true,
              _count: {
                select: {
                  tracks: true,
                },
              },
            },
          },
        },
      });

      if (!artist) {
        return null;
      }

      return {
        artist: mapDatabaseArtist({
          id: artist.id,
          name: artist.name,
          imageUrl: artist.imageUrl,
          _count: artist._count,
        }),
        albums: artist.albums.map(mapDatabaseAlbum),
      } satisfies ArtistDetail;
    },
  );
}

export async function getAlbumTracks(albumId: string) {
  return withDatabaseFallback(
    mockTracks
      .filter((track) => track.albumId === albumId)
      .map((track) => mapMockTrack(track.id)),
    async () => {
      const tracks = await prisma.track.findMany({
        where: { albumId },
        orderBy: { title: "asc" },
        include: {
          album: {
            include: {
              artist: true,
            },
          },
        },
      });

      return tracks.map((track) => mapDatabaseTrack(track));
    },
  );
}

export async function getAlbumDetail(
  albumId: string,
): Promise<AlbumDetail | null> {
  return withDatabaseFallback(
    mockAlbums.some((album) => album.id === albumId)
      ? {
          ...mapMockAlbum(albumId),
          tracks: mockTracks
            .filter((track) => track.albumId === albumId)
            .map((track) => mapMockTrack(track.id)),
        }
      : null,
    async () => {
      const album = await prisma.album.findUnique({
        where: { id: albumId },
        include: {
          artist: true,
          _count: {
            select: {
              tracks: true,
            },
          },
          tracks: {
            orderBy: { title: "asc" },
            include: {
              album: {
                include: {
                  artist: true,
                },
              },
            },
          },
        },
      });

      if (!album) {
        return null;
      }

      return {
        ...mapDatabaseAlbum(album),
        tracks: album.tracks.map((track) => mapDatabaseTrack(track)),
      } satisfies AlbumDetail;
    },
  );
}

export async function getUserPlaylists(userId: string) {
  if (userId === DEMO_VIEWER.id && !hasSupabaseEnv()) {
    return mockPlaylists.map((playlist) =>
      mapPlaylistSummaryFromDetail(mapMockPlaylist(playlist.id)),
    );
  }

  return withDatabaseFallback(
    userId === DEMO_VIEWER.id
      ? mockPlaylists.map((playlist) =>
          mapPlaylistSummaryFromDetail(mapMockPlaylist(playlist.id)),
        )
      : [],
    async () => {
      const playlists = await prisma.playlist.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        tracks: {
          orderBy: {
            position: "asc",
          },
          include: {
            track: {
              include: {
                album: {
                    include: {
                      artist: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return playlists.map((playlist) =>
        mapPlaylistSummaryFromDetail(mapDatabasePlaylist(playlist)),
      );
    },
  );
}

export async function getPlaylistTracks(
  playlistId: string,
  viewerId?: string,
): Promise<TrackSummary[]> {
  const playlist = await getPlaylistDetail(playlistId, viewerId);
  return playlist?.tracks ?? [];
}

export async function getPlaylistDetail(
  playlistId: string,
  viewerId?: string,
): Promise<PlaylistDetail | null> {
  const mockPlaylist = mockPlaylists.find((playlist) => playlist.id === playlistId);

  if (mockPlaylist && !hasSupabaseEnv()) {
    return mapMockPlaylist(playlistId);
  }

  if (!hasDatabaseEnv()) {
    if (!mockPlaylist) {
      return null;
    }

    return mapMockPlaylist(playlistId);
  }

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        tracks: {
          orderBy: {
            position: "asc",
          },
          include: {
            track: {
              include: {
                album: {
                  include: {
                    artist: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!playlist) {
      return mockPlaylist ? mapMockPlaylist(playlistId) : null;
    }

    if (!playlist.isPublic && playlist.user.id !== viewerId) {
      return null;
    }

    return mapDatabasePlaylist(playlist);
  } catch (error) {
    console.error("Failed to load playlist detail.", error);
    return mockPlaylist ? mapMockPlaylist(playlistId) : null;
  }
}

async function requirePersistedViewer(expectedUserId?: string) {
  const viewerState = await getCurrentViewer();

  if (!hasDatabaseEnv() || viewerState.isDemoMode || !viewerState.user) {
    throw new Error(
      "Configure Supabase Auth and Postgres before saving playlists.",
    );
  }

  if (expectedUserId && viewerState.user.id !== expectedUserId) {
    throw new Error("You can only modify your own library.");
  }

  return viewerState.user;
}

async function requireOwnedPlaylist(playlistId: string, viewerId: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!playlist || playlist.userId !== viewerId) {
    throw new Error("That playlist is unavailable.");
  }

  return playlist;
}

async function appendTrackToPlaylist(playlistId: string, trackId: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await prisma.$transaction(async (tx) => {
        const latestTrack = await tx.playlistTrack.findFirst({
          where: { playlistId },
          orderBy: {
            position: "desc",
          },
          select: {
            position: true,
          },
        });

        await tx.playlistTrack.create({
          data: {
            playlistId,
            trackId,
            position: (latestTrack?.position ?? -1) + 1,
          },
        });

        await tx.playlist.update({
          where: { id: playlistId },
          data: {
            updatedAt: new Date(),
          },
        });
      });

      return;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < 2
      ) {
        continue;
      }

      throw error;
    }
  }
}

function normalizeImportText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(feat|ft|featuring)\b.*$/g, " ")
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildCatalogMatchIndexes(
  tracks: Array<{
    id: string;
    title: string;
    album: { title: string; artist: { name: string } };
  }>,
) {
  const byTitleAndPrimaryArtist = new Map<string, string>();
  const byTitleAndAlbum = new Map<string, string>();
  const byTitle = new Map<string, string>();

  tracks.forEach((track) => {
    const normalizedTitle = normalizeImportText(track.title);
    const normalizedArtist = normalizeImportText(track.album.artist.name);
    const normalizedAlbum = normalizeImportText(track.album.title);

    byTitleAndPrimaryArtist.set(
      `${normalizedTitle}::${normalizedArtist}`,
      track.id,
    );
    byTitleAndAlbum.set(`${normalizedTitle}::${normalizedAlbum}`, track.id);
    byTitle.set(normalizedTitle, track.id);
  });

  return {
    byTitle,
    byTitleAndAlbum,
    byTitleAndPrimaryArtist,
  };
}

function matchImportedTrack(
  indexes: ReturnType<typeof buildCatalogMatchIndexes>,
  track: {
    title: string;
    albumTitle: string;
    artists: string[];
  },
) {
  const normalizedTitle = normalizeImportText(track.title);
  const normalizedAlbum = normalizeImportText(track.albumTitle);
  const normalizedArtists = track.artists.map(normalizeImportText).filter(Boolean);

  for (const artist of normalizedArtists) {
    const exactMatch = indexes.byTitleAndPrimaryArtist.get(
      `${normalizedTitle}::${artist}`,
    );

    if (exactMatch) {
      return exactMatch;
    }
  }

  const albumMatch = indexes.byTitleAndAlbum.get(
    `${normalizedTitle}::${normalizedAlbum}`,
  );

  if (albumMatch) {
    return albumMatch;
  }

  return indexes.byTitle.get(normalizedTitle) ?? null;
}

export async function createPlaylist(
  userId: string,
  name: string,
  description?: string,
) {
  const viewer = await requirePersistedViewer(userId);
  const parsed = playlistSchema.parse({
    name,
    description: description ?? "",
  });

  return prisma.playlist.create({
    data: {
      name: parsed.name,
      description: parsed.description || null,
      userId: viewer.id,
    },
  });
}

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
  const parsed = playlistTrackSchema.parse({ playlistId, trackId });
  const viewer = await requirePersistedViewer();
  await requireOwnedPlaylist(parsed.playlistId, viewer.id);
  await appendTrackToPlaylist(parsed.playlistId, parsed.trackId);

  return parsed;
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  playlistTrackId: string,
) {
  const parsed = playlistTrackRemoveSchema.parse({ playlistId, playlistTrackId });
  const viewer = await requirePersistedViewer();
  await requireOwnedPlaylist(parsed.playlistId, viewer.id);
  await prisma.$transaction(async (tx) => {
    const deleted = await tx.playlistTrack.deleteMany({
      where: {
        id: parsed.playlistTrackId,
        playlistId: parsed.playlistId,
      },
    });

    if (deleted.count === 0) {
      throw new Error("That playlist item no longer exists.");
    }

    await tx.playlist.update({
      where: { id: parsed.playlistId },
      data: {
        updatedAt: new Date(),
      },
    });
  });

  return parsed;
}

export async function deletePlaylist(playlistId: string) {
  const parsed = playlistDeleteSchema.parse({ playlistId });
  const viewer = await requirePersistedViewer();
  await requireOwnedPlaylist(parsed.playlistId, viewer.id);

  await prisma.playlist.delete({
    where: { id: parsed.playlistId },
  });

  return parsed;
}

export async function importSpotifyPlaylist(
  spotifyPlaylistId: string,
): Promise<SpotifyImportResult> {
  const parsed = spotifyImportSchema.parse({ spotifyPlaylistId });
  const viewer = await requirePersistedViewer();
  const spotifyPlaylist = await getSpotifyPlaylistImportBundle(
    parsed.spotifyPlaylistId,
  );
  const catalogTracks = await prisma.track.findMany({
    include: {
      album: {
        include: {
          artist: true,
        },
      },
    },
  });
  const indexes = buildCatalogMatchIndexes(catalogTracks);
  const matchedTrackIds = spotifyPlaylist.tracks
    .map((track) => matchImportedTrack(indexes, track))
    .filter((trackId): trackId is string => Boolean(trackId));
  const importedCount = matchedTrackIds.length;
  const unmatchedCount = spotifyPlaylist.tracks.length - importedCount;

  if (importedCount === 0) {
    throw new Error(
      "None of the songs in that Spotify playlist matched your local catalog yet.",
    );
  }

  const description = [
    spotifyPlaylist.playlist.description?.trim(),
    "Imported from Spotify metadata.",
  ]
    .filter(Boolean)
    .join(" ");

  const playlist = await prisma.playlist.create({
    data: {
      name: spotifyPlaylist.playlist.name,
      description: description || null,
      userId: viewer.id,
    },
  });

  await prisma.playlistTrack.createMany({
    data: matchedTrackIds.map((trackId, position) => ({
      playlistId: playlist.id,
      trackId,
      position,
    })),
  });

  return {
    playlistId: playlist.id,
    importedCount,
    unmatchedCount,
    playlistName: playlist.name,
  };
}
