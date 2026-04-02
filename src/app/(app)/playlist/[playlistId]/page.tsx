import { notFound } from "next/navigation";

import { Artwork } from "@/components/catalog/artwork";
import { TrackRow } from "@/components/catalog/track-row";
import { DeletePlaylistButton } from "@/components/playlists/delete-playlist-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCurrentViewer,
  getPlaylistDetail,
  getUserPlaylists,
} from "@/lib/music-service";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const { playlistId } = await params;
  const viewer = await getCurrentViewer();
  const playlist = await getPlaylistDetail(playlistId, viewer.user?.id);

  if (!playlist) {
    notFound();
  }

  const playlists = viewer.user ? await getUserPlaylists(viewer.user.id) : [];
  const isOwner = viewer.user?.id === playlist.user.id && !viewer.isDemoMode;
  const canEditPlaylists =
    Boolean(viewer.user) && viewer.hasDatabase && !viewer.isDemoMode;

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <Artwork
            className="aspect-square rounded-[28px]"
            seed={playlist.id}
            title={playlist.name}
          />
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{playlist.isPublic ? "Public" : "Private"}</Badge>
                <Badge>{playlist.trackCount} tracks</Badge>
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {playlist.name}
                </h1>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">
                  {playlist.description || "Playlist without a description yet."}
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                Curated by {playlist.user.name}
              </p>
            </div>

            {isOwner ? <DeletePlaylistButton playlistId={playlist.id} /> : null}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        {playlist.tracks.map((track, index) => (
          <TrackRow
            allowPlaylistActions={canEditPlaylists}
            index={index}
            key={track.queueId}
            playlists={playlists}
            queue={playlist.tracks}
            removableFromPlaylistId={isOwner ? playlist.id : undefined}
            track={track}
          />
        ))}
      </section>
    </div>
  );
}
