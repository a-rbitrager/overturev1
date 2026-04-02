"use client";

import { Pause, Play } from "lucide-react";

import { AddTrackDialog } from "@/components/playlists/add-track-dialog";
import { RemoveTrackButton } from "@/components/playlists/remove-track-button";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import { usePlayerStore } from "@/lib/player-store";
import type { PlaylistSummary, TrackSummary } from "@/lib/types";

export function TrackRow({
  track,
  queue,
  index,
  playlists,
  allowPlaylistActions,
  removableFromPlaylistId,
}: {
  track: TrackSummary;
  queue: TrackSummary[];
  index: number;
  playlists: PlaylistSummary[];
  allowPlaylistActions: boolean;
  removableFromPlaylistId?: string;
}) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const isCurrent = currentTrack?.queueId === track.queueId;

  return (
    <div className="group flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/4 px-3 py-3 transition-colors hover:border-white/14 hover:bg-white/7">
      <Button
        className="shrink-0"
        onClick={() => {
          if (isCurrent) {
            togglePlayback();
            return;
          }

          playTrack(track, queue);
        }}
        size="icon"
        variant={isCurrent && isPlaying ? "default" : "secondary"}
      >
        {isCurrent && isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <button
        className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left"
        onClick={() => playTrack(track, queue)}
        type="button"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {index + 1}. {track.title}
          </p>
          <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)]">
            {track.artist.name} • {track.album.title}
          </p>
        </div>
        <div className="hidden text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)] sm:block">
          {formatDuration(track.duration)}
        </div>
      </button>

      <div className="flex items-center gap-1">
        {removableFromPlaylistId && track.playlistTrackId ? (
          <RemoveTrackButton
            playlistId={removableFromPlaylistId}
            playlistTrackId={track.playlistTrackId}
          />
        ) : null}
        <AddTrackDialog
          disabled={!allowPlaylistActions}
          playlists={playlists}
          trackId={track.id}
        />
      </div>
    </div>
  );
}
