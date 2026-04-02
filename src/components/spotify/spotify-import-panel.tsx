"use client";

import Link from "next/link";
import { ArrowDownToLine, ExternalLink, Link2, Unplug } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  disconnectSpotify,
  importSpotifyPlaylist,
} from "@/actions/spotify";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SpotifyImportState } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SpotifyImportPanel({
  enabled,
  spotify,
}: {
  enabled: boolean;
  spotify: SpotifyImportState;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  if (!enabled) {
    return (
      <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
        <div className="flex items-center gap-2">
          <Badge>Spotify import</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
          Sign in with Supabase first, then connect Spotify to import playlist
          metadata into your library.
        </p>
      </div>
    );
  }

  if (!spotify.available) {
    return (
      <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
        <Badge>Spotify import</Badge>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
          Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to enable
          metadata-only playlist import.
        </p>
      </div>
    );
  }

  if (!spotify.connected) {
    return (
      <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
        <div className="flex items-center gap-2">
          <Badge>Spotify import</Badge>
          <span className="text-xs text-[color:var(--muted-foreground)]">
            Metadata only
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
          Pull in a Spotify playlist, then match it against audio you already
          host in your own catalog.
        </p>
        <Link
          className={cn(buttonVariants({ variant: "default" }), "mt-4 w-full")}
          href="/api/spotify/connect"
        >
          <Link2 className="mr-2 h-4 w-4" />
          Connect Spotify
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge>Spotify import</Badge>
            <span className="text-xs text-[color:var(--muted-foreground)]">
              Metadata only
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)]">
            Import one of your Spotify playlists and keep only the tracks that
            exist in your local catalog.
          </p>
        </div>
        <Button
          disabled={disconnecting}
          onClick={() => {
            setDisconnecting(true);
            startTransition(async () => {
              try {
                await disconnectSpotify();
                toast.success("Spotify disconnected.");
                router.refresh();
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Could not disconnect Spotify.",
                );
              } finally {
                setDisconnecting(false);
              }
            });
          }}
          size="icon"
          variant="ghost"
        >
          <Unplug className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {spotify.playlists.map((playlist) => (
          <div
            className="rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3"
            key={playlist.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {playlist.name}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                  {playlist.trackCount} tracks by {playlist.ownerName}
                </p>
              </div>
              <a
                className="rounded-full p-2 text-[color:var(--muted-foreground)] transition hover:bg-white/8 hover:text-white"
                href={playlist.externalUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-3 flex items-center justify-end">
              <Button
                disabled={pendingId === playlist.id}
                onClick={() => {
                  setPendingId(playlist.id);
                  startTransition(async () => {
                    try {
                      const result = await importSpotifyPlaylist(playlist.id);
                      toast.success(
                        result.unmatchedCount > 0
                          ? `Imported ${result.importedCount} songs. ${result.unmatchedCount} still need matching audio in your catalog.`
                          : `Imported ${result.playlistName}.`,
                      );
                      router.push(`/playlist/${result.playlistId}`);
                      router.refresh();
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Could not import the Spotify playlist.",
                      );
                    } finally {
                      setPendingId(null);
                    }
                  });
                }}
                size="sm"
                variant="outline"
              >
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                {pendingId === playlist.id ? "Importing" : "Import"}
              </Button>
            </div>
          </div>
        ))}

        {spotify.playlists.length === 0 ? (
          <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
            No Spotify playlists were returned for this account yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
