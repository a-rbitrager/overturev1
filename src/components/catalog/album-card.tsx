import Link from "next/link";

import { Artwork } from "@/components/catalog/artwork";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AlbumSummary } from "@/lib/types";

export function AlbumCard({ album }: { album: AlbumSummary }) {
  return (
    <Link href={`/album/${album.id}`}>
      <Card className="group h-full overflow-hidden transition-colors duration-300 hover:border-white/18">
        <CardContent className="space-y-4 p-4">
          <Artwork
            seed={album.id}
            title={album.title}
            className="aspect-square rounded-[22px]"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{album.title}</h3>
              <Badge>{album.releaseYear}</Badge>
            </div>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              {album.artist.name}
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
              {album.trackCount} tracks
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
