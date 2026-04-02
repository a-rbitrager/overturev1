"use server";

import {
  getAlbumTracks as getAlbumTracksData,
  getArtistAlbums as getArtistAlbumsData,
  searchCatalog as searchCatalogData,
} from "@/lib/music-service";

export async function getArtistAlbums(artistId: string) {
  return getArtistAlbumsData(artistId);
}

export async function getAlbumTracks(albumId: string) {
  return getAlbumTracksData(albumId);
}

export async function searchCatalog(query: string) {
  return searchCatalogData(query);
}
