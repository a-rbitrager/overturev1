import Link from "next/link";
import { Headphones, LogIn, Music2, Search, UserPlus } from "lucide-react";

import { CreatePlaylistDialog } from "@/components/playlists/create-playlist-dialog";
import { SpotifyImportPanel } from "@/components/spotify/spotify-import-panel";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRuntime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  PlaylistSummary,
  SpotifyImportState,
  ViewerState,
} from "@/lib/types";

export function AppSidebar({
  viewer,
  playlists,
  spotify,
}: {
  viewer: ViewerState;
  playlists: PlaylistSummary[];
  spotify: SpotifyImportState;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:h-[calc(100vh-2rem)] lg:w-[290px]">
      <Card className="overflow-hidden">
        <CardContent className="space-y-6 p-5">
          <div className="space-y-3">
            <Badge>{viewer.isDemoMode ? "Demo mode" : "Library"}</Badge>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Overture
              </h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                A calm, playlist-first player for legal audio, quick queueing,
                and lightweight listening sessions.
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white transition-colors hover:bg-white/8"
              href="/"
            >
              <Search className="h-4 w-4 text-[color:var(--accent)]" />
              Discover
            </Link>
            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white transition-colors hover:bg-white/8"
              href="/"
            >
              <Music2 className="h-4 w-4 text-[color:var(--secondary)]" />
              Albums
            </Link>
            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white transition-colors hover:bg-white/8"
              href="/"
            >
              <Headphones className="h-4 w-4 text-[color:var(--accent)]" />
              Player queue
            </Link>
          </nav>
        </CardContent>
      </Card>

      <Card className="flex min-h-0 flex-1 overflow-hidden">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Your playlists</p>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {viewer.user ? `${playlists.length} saved` : "Sign in to save"}
              </p>
            </div>
            {viewer.user && !viewer.isDemoMode ? (
              <CreatePlaylistDialog userId={viewer.user.id} />
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 lg:max-h-[38vh]">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                className="block rounded-[22px] border border-white/8 bg-white/6 p-4 transition-colors hover:border-white/16 hover:bg-white/8"
                href={`/playlist/${playlist.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {playlist.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[color:var(--muted-foreground)]">
                      {playlist.description || "Custom playlist"}
                    </p>
                  </div>
                  <Badge className="shrink-0">{playlist.trackCount}</Badge>
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                  {formatRuntime(playlist.totalDuration)}
                </p>
              </Link>
            ))}

            {playlists.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/12 bg-white/4 p-4 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {viewer.isDemoMode
                  ? "Finish Supabase setup to save real playlists. The demo catalog still lets you explore the UI and player."
                  : "Create a playlist to start collecting tracks from albums and search results."}
              </div>
            ) : null}
          </div>

          <SpotifyImportPanel
            enabled={Boolean(viewer.user) && viewer.hasDatabase && !viewer.isDemoMode}
            spotify={spotify}
          />

          {viewer.user && !viewer.isDemoMode ? (
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-3">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                Signed in as {viewer.user.name}
              </p>
              <SignOutButton />
            </div>
          ) : null}

          {!viewer.user && !viewer.isDemoMode ? (
            <div className="space-y-2">
              <Link
                className={cn(buttonVariants({ variant: "default" }), "w-full")}
                href="/signup"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create account
              </Link>
              <Link
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                href="/login"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </aside>
  );
}
