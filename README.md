# Overture

Overture is a playlist-first music app starter built with Next.js App Router, Supabase, Prisma, Zustand, and Tailwind CSS. It includes:

- Supabase SSR auth with email login and signup
- Prisma-backed artists, albums, tracks, playlists, and playlist tracks
- A Spotify-style shell with sidebar, content area, and bottom player
- Direct audio playback from public URLs instead of proxying media through Next.js
- A demo fallback catalog so the UI works before Supabase is configured

Use this project for public-domain, Creative Commons, or otherwise rights-cleared audio you are allowed to distribute.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase Auth and Storage
- Prisma 7 with PostgreSQL adapter
- Zustand
- Lucide icons
- Radix-powered dialog primitives

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

Note: Prisma 7 reads the datasource URL from `prisma.config.ts`, so `DATABASE_URL` is the connection string that matters for Prisma commands in this repo.

## Supabase Storage

Do not build a custom upload backend for the initial version.

1. Open the Supabase Dashboard.
2. Create a public bucket named `audio-files`.
3. Upload files that match the seeded names:
   `nightglass.mp3`, `blue-lattice.mp3`, `late-bus-home.mp3`, `neon-turnpike.mp3`, `dry-river-radio.mp3`, `red-clay-repeat.mp3`
4. Keep `audioUrl` values in this format:

```text
https://[PROJECT_ID].supabase.co/storage/v1/object/public/audio-files/[FILENAME].mp3
```

## Spotify Import

Spotify import is metadata-only. This app does not stream or download Spotify audio.

1. Create a Spotify app in the Spotify Developer Dashboard.
2. Add these redirect URIs:
   - `http://localhost:3000/api/spotify/callback`
   - `https://YOUR-PRODUCTION-DOMAIN/api/spotify/callback`
3. Copy the client ID and client secret into `.env.local`.
4. Connect Spotify from the sidebar after signing in with Supabase.

Imported playlists are matched against tracks that already exist in your own catalog. Any unmatched songs are skipped and reported back in the UI.

## Database

Generate Prisma client artifacts, push the schema, and seed the catalog:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If Supabase is not configured yet, the app falls back to a demo catalog with embedded preview audio so you can still exercise the UI and player.

## Verification

The current implementation has been checked with:

```bash
npm run lint
npm run build
```

## Deploying To Vercel

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. Import the repo into Vercel.
3. Add the production environment variables in Vercel:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. In Supabase:
   - keep the `audio-files` bucket public
   - upload your audio assets
   - set the Auth site URL to your production domain
   - add your Vercel preview and production URLs to the auth redirect allow-list if you use email confirmations
5. In Spotify:
   - add `https://YOUR-PRODUCTION-DOMAIN/api/spotify/callback` as a redirect URI
6. Run database setup against production:
   - `npm run db:generate`
   - `npm run db:push`
   - `npm run db:seed`
7. Trigger a Vercel deployment and verify:
   - signup/login
   - playlist creation and removal
   - player controls including shuffle and repeat
   - Spotify playlist import
   - direct audio playback from Supabase Storage

## Project Notes

- Server reads and writes are split between `src/lib/music-service.ts` and server action wrappers in `src/actions/`.
- Playlist mutations are secured against the authenticated viewer rather than trusting client-supplied ownership.
- Audio is intended to stream directly from Supabase Storage public URLs for low latency and to keep bandwidth off the Next.js server.
- Playlist entries now preserve explicit order and allow duplicate tracks, which keeps playback and Spotify imports faithful to the source queue.
