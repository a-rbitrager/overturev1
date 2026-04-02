import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

import { AlbumCard } from "@/components/catalog/album-card";
import { Artwork } from "@/components/catalog/artwork";
import { TrackRow } from "@/components/catalog/track-row";
import { SearchBar } from "@/components/layout/search-bar";
import { SetupCallout } from "@/components/setup/setup-callout";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCurrentViewer,
  getHomeData,
  getUserPlaylists,
} from "@/lib/music-service";
import { cn } from "@/lib/utils";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | string[] }>;
}) {
  const queryParams = await searchParams;
  const query = Array.isArray(queryParams.query)
    ? queryParams.query[0] ?? ""
    : queryParams.query ?? "";
  const viewer = await getCurrentViewer();
  const home = await getHomeData(query);
  const playlists = viewer.user ? await getUserPlaylists(viewer.user.id) : [];
  const canEditPlaylists =
    Boolean(viewer.user) && viewer.hasDatabase && !viewer.isDemoMode;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Badge>{query ? "Search mode" : "Discover"}</Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Build a calming, playlist-first listening experience without a paid backend.
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
              Overture pairs Next.js App Router, Supabase Auth and Storage,
              Prisma, and Zustand into a Spotify-style shell tuned for
              rights-cleared audio, direct storage streaming, and low-friction
              playback.
            </p>
          </div>
          <SearchBar defaultValue={query} />
        </div>

        <Card className="overflow-hidden">
          <CardContent className="space-y-4 p-5">
            <Badge>{viewer.isDemoMode ? "Demo catalog" : "Session"}</Badge>
            <div>
              <p className="text-xl font-semibold text-white">
                {viewer.user ? viewer.user.name : "Not signed in"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">
                {viewer.isDemoMode
                  ? "You are seeing the embedded demo dataset and player previews. Connect Supabase to unlock real auth, storage, and persistence."
                  : viewer.user
                    ? "Your account is ready for real playlists and Supabase-backed playback."
                    : "Browse the catalog now, then sign in when you want your library saved."}
              </p>
            </div>

            {!viewer.user && !viewer.isDemoMode ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  className={cn(buttonVariants({ variant: "default" }), "w-full")}
                  href="/signup"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create account
                </Link>
                <Link
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  href="/login"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <SetupCallout viewer={viewer} />

      {playlists.length > 0 && !query ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Your playlists</h2>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              Quick access to your saved mixes and queue sources.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                <Card className="h-full transition-colors hover:border-white/18">
                  <CardContent className="space-y-4 p-4">
                    <Artwork
                      className="aspect-[1.2/1] rounded-[24px]"
                      seed={playlist.id}
                      title={playlist.name}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {playlist.name}
                      </h3>
                      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                        {playlist.description || "Custom playlist"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {query ? (
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Search results for “{query}”
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
              Server-rendered catalog results using the same data model as
              albums, artists, and playlists.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {home.searchResults.albums.map((album) => (
              <AlbumCard album={album} key={album.id} />
            ))}
          </div>

          {home.searchResults.artists.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {home.searchResults.artists.map((artist) => (
                <Link href={`/artist/${artist.id}`} key={artist.id}>
                  <Card className="transition-colors hover:border-white/18">
                    <CardContent className="space-y-4 p-4">
                      <Artwork
                        className="aspect-[1.2/1] rounded-[24px]"
                        seed={artist.id}
                        title={artist.name}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {artist.name}
                        </h3>
                        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                          {artist.albumCount} releases
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : null}

          <div className="space-y-3">
            {home.searchResults.tracks.map((track, index) => (
                    <TrackRow
                      allowPlaylistActions={canEditPlaylists}
                      index={index}
                      key={track.queueId}
                      playlists={playlists}
                      queue={home.searchResults.tracks}
                      track={track}
              />
            ))}
            {home.searchResults.albums.length === 0 &&
            home.searchResults.artists.length === 0 &&
            home.searchResults.tracks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  No matches yet. Try a track title like{" "}
                  <span className="text-white">Nightglass</span> or an artist
                  like <span className="text-white">Aurora Echo</span>.
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      ) : (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Featured albums
              </h2>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                Album-first browsing keeps queue building fast and predictable.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {home.featuredAlbums.map((album) => (
                <AlbumCard album={album} key={album.id} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Card className="overflow-hidden">
              <CardContent className="space-y-5 p-5">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Trending tracks
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    Every row can start playback and add tracks to a playlist.
                  </p>
                </div>
                <div className="space-y-3">
                  {home.trendingTracks.map((track, index) => (
                    <TrackRow
                      allowPlaylistActions={canEditPlaylists}
                      index={index}
                      key={track.queueId}
                      playlists={playlists}
                      queue={home.trendingTracks}
                      track={track}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {home.featuredArtists.map((artist) => (
                <Link href={`/artist/${artist.id}`} key={artist.id}>
                  <Card className="transition-colors hover:border-white/18">
                    <CardContent className="grid gap-4 p-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-center">
                      <Artwork
                        className="aspect-square rounded-[24px]"
                        seed={artist.id}
                        title={artist.name}
                      />
                      <div className="space-y-2">
                        <Badge>Artist</Badge>
                        <h3 className="text-2xl font-semibold text-white">
                          {artist.name}
                        </h3>
                        <p className="text-sm text-[color:var(--muted-foreground)]">
                          {artist.albumCount} releases in the starter catalog
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
