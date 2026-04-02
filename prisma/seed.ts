import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const artists = [
  {
    id: "artist-aurora-echo",
    name: "Aurora Echo",
    imageUrl: null,
  },
  {
    id: "artist-golden-static",
    name: "Golden Static",
    imageUrl: null,
  },
  {
    id: "artist-silt-and-signal",
    name: "Silt & Signal",
    imageUrl: null,
  },
];

const albums = [
  {
    id: "album-midnight-bloom",
    title: "Midnight Bloom",
    artistId: "artist-aurora-echo",
    coverUrl: "",
    releaseYear: 2025,
  },
  {
    id: "album-sunline-motel",
    title: "Sunline Motel",
    artistId: "artist-golden-static",
    coverUrl: "",
    releaseYear: 2024,
  },
  {
    id: "album-rust-and-rain",
    title: "Rust & Rain",
    artistId: "artist-silt-and-signal",
    coverUrl: "",
    releaseYear: 2026,
  },
];

const seedTrackFiles = [
  {
    id: "track-nightglass",
    title: "Nightglass",
    albumId: "album-midnight-bloom",
    duration: 187,
    filename: "nightglass.mp3",
  },
  {
    id: "track-blue-lattice",
    title: "Blue Lattice",
    albumId: "album-midnight-bloom",
    duration: 201,
    filename: "blue-lattice.mp3",
  },
  {
    id: "track-late-bus-home",
    title: "Late Bus Home",
    albumId: "album-sunline-motel",
    duration: 214,
    filename: "late-bus-home.mp3",
  },
  {
    id: "track-neon-turnpike",
    title: "Neon Turnpike",
    albumId: "album-sunline-motel",
    duration: 194,
    filename: "neon-turnpike.mp3",
  },
  {
    id: "track-dry-river-radio",
    title: "Dry River Radio",
    albumId: "album-rust-and-rain",
    duration: 226,
    filename: "dry-river-radio.mp3",
  },
  {
    id: "track-red-clay-repeat",
    title: "Red Clay Repeat",
    albumId: "album-rust-and-rain",
    duration: 205,
    filename: "red-clay-repeat.mp3",
  },
];

const seededPlaylists = [
  {
    id: "playlist-open-road",
    name: "Open Road",
    description: "A sample road-trip queue seeded with the starter catalog.",
    coverUrl: null,
    isPublic: true,
    trackIds: [
      "track-nightglass",
      "track-late-bus-home",
      "track-dry-river-radio",
    ],
  },
  {
    id: "playlist-slow-signal",
    name: "Slow Signal",
    description: "A softer playlist for checking the player, queue, and playlists.",
    coverUrl: null,
    isPublic: false,
    trackIds: [
      "track-blue-lattice",
      "track-neon-turnpike",
      "track-red-clay-repeat",
    ],
  },
];

function buildSupabaseAudioUrl(filename: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is required for seeding. Upload your audio files to the public 'audio-files' bucket first.",
    );
  }

  return `${supabaseUrl}/storage/v1/object/public/audio-files/${filename}`;
}

async function main() {
  for (const artist of artists) {
    await prisma.artist.upsert({
      where: { id: artist.id },
      update: artist,
      create: artist,
    });
  }

  for (const album of albums) {
    await prisma.album.upsert({
      where: { id: album.id },
      update: album,
      create: album,
    });
  }

  for (const track of seedTrackFiles) {
    await prisma.track.upsert({
      where: { id: track.id },
      update: {
        title: track.title,
        albumId: track.albumId,
        duration: track.duration,
        audioUrl: buildSupabaseAudioUrl(track.filename),
      },
      create: {
        id: track.id,
        title: track.title,
        albumId: track.albumId,
        duration: track.duration,
        audioUrl: buildSupabaseAudioUrl(track.filename),
      },
    });
  }

  await prisma.user.upsert({
    where: { id: "user-demo-curator" },
    update: {
      email: "demo@overture.app",
      name: "Demo Curator",
      avatarUrl: null,
    },
    create: {
      id: "user-demo-curator",
      email: "demo@overture.app",
      name: "Demo Curator",
      avatarUrl: null,
    },
  });

  for (const playlist of seededPlaylists) {
    await prisma.playlist.upsert({
      where: { id: playlist.id },
      update: {
        name: playlist.name,
        description: playlist.description,
        coverUrl: playlist.coverUrl,
        userId: "user-demo-curator",
        isPublic: playlist.isPublic,
      },
      create: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        coverUrl: playlist.coverUrl,
        userId: "user-demo-curator",
        isPublic: playlist.isPublic,
      },
    });

    await prisma.playlistTrack.deleteMany({
      where: { playlistId: playlist.id },
    });

    await prisma.playlistTrack.createMany({
      data: playlist.trackIds.map((trackId, position) => ({
        playlistId: playlist.id,
        trackId,
        position,
      })),
    });
  }

  console.log("Seeded artists, albums, tracks, and demo playlists.");
  console.log(
    "Make sure these files exist in Supabase Storage/audio-files: nightglass.mp3, blue-lattice.mp3, late-bus-home.mp3, neon-turnpike.mp3, dry-river-radio.mp3, red-clay-repeat.mp3",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
