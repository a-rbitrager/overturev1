import { notFound } from "next/navigation";

import { Artwork } from "@/components/catalog/artwork";
import { TrackRow } from "@/components/catalog/track-row";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAlbumDetail,
  getCurrentViewer,
  getUserPlaylists,
} from "@/lib/music-service";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const album = await getAlbumDetail(albumId);

  if (!album) {
    notFound();
  }

  const viewer = await getCurrentViewer();
  const playlists = viewer.user ? await getUserPlaylists(viewer.user.id) : [];
  const canEditPlaylists =
    Boolean(viewer.user) && viewer.hasDatabase && !viewer.isDemoMode;

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <Artwork
            className="aspect-square rounded-[28px]"
            seed={album.id}
            title={album.title}
          />
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <Badge>Album</Badge>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {album.title}
                </h1>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  {album.artist.name} • {album.releaseYear} • {album.trackCount} tracks
                </p>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted-foreground)]">
              Queue the full album or cherry-pick tracks into a playlist without
              routing audio through your Next.js server.
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        {album.tracks.map((track, index) => (
          <TrackRow
            allowPlaylistActions={canEditPlaylists}
            index={index}
            key={track.queueId}
            playlists={playlists}
            queue={album.tracks}
            track={track}
          />
        ))}
      </section>
    </div>
  );
}
