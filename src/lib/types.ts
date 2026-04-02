export type Viewer = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export type ViewerState = {
  user: Viewer | null;
  hasSupabase: boolean;
  hasDatabase: boolean;
  isDemoMode: boolean;
};

export type ArtistSummary = {
  id: string;
  name: string;
  imageUrl: string | null;
  albumCount: number;
};

export type AlbumSummary = {
  id: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number;
  trackCount: number;
  artist: {
    id: string;
    name: string;
  };
};

export type AlbumDetail = AlbumSummary & {
  tracks: TrackSummary[];
};

export type TrackSummary = {
  queueId: string;
  playlistTrackId?: string;
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  album: {
    id: string;
    title: string;
    coverUrl: string | null;
    releaseYear: number;
  };
  artist: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

export type PlaylistSummary = {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  trackCount: number;
  totalDuration: number;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export type PlaylistDetail = PlaylistSummary & {
  tracks: TrackSummary[];
};

export type RepeatMode = "off" | "all" | "one";

export type SearchResults = {
  artists: ArtistSummary[];
  albums: AlbumSummary[];
  tracks: TrackSummary[];
};

export type ArtistDetail = {
  artist: ArtistSummary;
  albums: AlbumSummary[];
};

export type HomeData = {
  featuredArtists: ArtistSummary[];
  featuredAlbums: AlbumSummary[];
  trendingTracks: TrackSummary[];
  searchResults: SearchResults;
};

export type SpotifyPlaylistSummary = {
  id: string;
  name: string;
  description: string | null;
  ownerName: string;
  trackCount: number;
  externalUrl: string;
};

export type SpotifyImportState = {
  available: boolean;
  connected: boolean;
  playlists: SpotifyPlaylistSummary[];
};

export type SpotifyImportResult = {
  playlistId: string;
  importedCount: number;
  unmatchedCount: number;
  playlistName: string;
};
