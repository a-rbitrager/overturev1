"use server";

import { revalidatePath } from "next/cache";

import {
  addTrackToPlaylist as addTrackToPlaylistData,
  createPlaylist as createPlaylistData,
  deletePlaylist as deletePlaylistData,
  getPlaylistTracks as getPlaylistTracksData,
  getUserPlaylists as getUserPlaylistsData,
  removeTrackFromPlaylist as removeTrackFromPlaylistData,
} from "@/lib/music-service";

export async function createPlaylist(
  userId: string,
  name: string,
  description?: string,
) {
  const playlist = await createPlaylistData(userId, name, description);

  revalidatePath("/");
  revalidatePath(`/playlist/${playlist.id}`);

  return playlist;
}

export async function getUserPlaylists(userId: string) {
  return getUserPlaylistsData(userId);
}

export async function getPlaylistTracks(playlistId: string) {
  return getPlaylistTracksData(playlistId);
}

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
  const result = await addTrackToPlaylistData(playlistId, trackId);

  revalidatePath("/");
  revalidatePath(`/playlist/${playlistId}`);

  return result;
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  playlistTrackId: string,
) {
  const result = await removeTrackFromPlaylistData(playlistId, playlistTrackId);

  revalidatePath("/");
  revalidatePath(`/playlist/${playlistId}`);

  return result;
}

export async function deletePlaylist(playlistId: string) {
  const result = await deletePlaylistData(playlistId);

  revalidatePath("/");

  return result;
}
