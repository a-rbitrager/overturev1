import Link from "next/link";

import { Artwork } from "@/components/catalog/artwork";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ArtistDetail } from "@/lib/types";

export function ArtistProfile({ artist }: { artist: ArtistDetail }) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[240px_minmax(0,1fr)]">
          <Artwork
            seed={artist.artist.id}
            title={artist.artist.name}
            className="aspect-square rounded-[26px]"
          />
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <Badge>Artist</Badge>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {artist.artist.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted-foreground)]">
                  Browse albums, queue tracks into the global player, and add
                  songs to playlists from a single surface.
                </p>
              </div>
            </div>
            <div className="text-sm text-[color:var(--muted-foreground)]">
              {artist.artist.albumCount} releases in catalog
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {artist.albums.map((album) => (
          <Link key={album.id} href={`/album/${album.id}`}>
            <Card className="h-full transition-colors hover:border-white/18">
              <CardContent className="space-y-4 p-4">
                <Artwork
                  seed={album.id}
                  title={album.title}
                  className="aspect-square rounded-[22px]"
                />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {album.title}
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {album.releaseYear} • {album.trackCount} tracks
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
