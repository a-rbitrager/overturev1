import { notFound } from "next/navigation";

import { ArtistProfile } from "@/components/catalog/artist-profile";
import { getArtistDetail } from "@/lib/music-service";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = await params;
  const artist = await getArtistDetail(artistId);

  if (!artist) {
    notFound();
  }

  return <ArtistProfile artist={artist} />;
}
