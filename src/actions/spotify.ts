"use server";

import { revalidatePath } from "next/cache";

import { clearSpotifySession } from "@/lib/spotify";
import { importSpotifyPlaylist as importSpotifyPlaylistData } from "@/lib/music-service";

export async function importSpotifyPlaylist(spotifyPlaylistId: string) {
  const result = await importSpotifyPlaylistData(spotifyPlaylistId);

  revalidatePath("/");
  revalidatePath(`/playlist/${result.playlistId}`);

  return result;
}

export async function disconnectSpotify() {
  await clearSpotifySession();
  revalidatePath("/");
}
