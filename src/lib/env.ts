export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasDatabaseEnv() {
  return Boolean(process.env.DATABASE_URL && process.env.DIRECT_URL);
}

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function hasSpotifyEnv() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

export function getSpotifyClientId() {
  return process.env.SPOTIFY_CLIENT_ID ?? "";
}

export function getSpotifyClientSecret() {
  return process.env.SPOTIFY_CLIENT_SECRET ?? "";
}
