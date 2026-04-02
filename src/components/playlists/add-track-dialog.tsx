"use client";

import { PlusCircle } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { addTrackToPlaylist } from "@/actions/playlists";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PlaylistSummary } from "@/lib/types";

export function AddTrackDialog({
  trackId,
  playlists,
  disabled,
}: {
  trackId: string;
  playlists: PlaylistSummary[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const playlistOptions = useMemo(
    () =>
      playlists.slice().sort((left, right) => left.name.localeCompare(right.name)),
    [playlists],
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled || playlistOptions.length === 0}
          size="icon"
          variant="ghost"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
          <DialogDescription>
            Pick a destination and this track will be added instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          {playlistOptions.map((playlist) => (
            <button
              key={playlist.id}
              className="flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-white/4 px-4 py-4 text-left transition hover:border-white/18 hover:bg-white/8"
              onClick={() => {
                setPendingId(playlist.id);
                startTransition(async () => {
                  try {
                    await addTrackToPlaylist(playlist.id, trackId);
                    toast.success(`Added to ${playlist.name}.`);
                    setOpen(false);
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Could not add the track.",
                    );
                  } finally {
                    setPendingId(null);
                  }
                });
              }}
              type="button"
            >
              <div>
                <p className="text-sm font-semibold text-white">{playlist.name}</p>
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                  {playlist.trackCount} tracks
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                {pendingId === playlist.id ? "Adding" : "Select"}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
