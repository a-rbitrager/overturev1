import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Use at least 6 characters."),
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters.")
    .max(40, "Keep it under 40 characters.")
    .optional(),
});

export const playlistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Playlist names should be at least 2 characters.")
    .max(60, "Playlist names should stay under 60 characters."),
  description: z
    .string()
    .trim()
    .max(160, "Descriptions should stay under 160 characters.")
    .optional()
    .or(z.literal("")),
});

export const playlistTrackSchema = z.object({
  playlistId: z.string().min(1),
  trackId: z.string().min(1),
});

export const playlistTrackRemoveSchema = z.object({
  playlistId: z.string().min(1),
  playlistTrackId: z.string().min(1),
});

export const playlistDeleteSchema = z.object({
  playlistId: z.string().min(1),
});

export const spotifyImportSchema = z.object({
  spotifyPlaylistId: z.string().min(1),
});
