"use client";

import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { Artwork } from "@/components/catalog/artwork";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import { usePlayerStore } from "@/lib/player-store";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastQueueIdRef = useRef<string | null>(null);
  const activePlaylist = usePlayerStore((state) => state.activePlaylist);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const shuffleEnabled = usePlayerStore((state) => state.shuffleEnabled);
  const volume = usePlayerStore((state) => state.volume);
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const previousTrack = usePlayerStore((state) => state.previousTrack);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const syncProgress = usePlayerStore((state) => state.syncProgress);
  const toggleMute = usePlayerStore((state) => state.toggleMute);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    const trackChanged = lastQueueIdRef.current !== currentTrack.queueId;

    if (trackChanged) {
      if (audio.src !== currentTrack.audioUrl) {
        audio.src = currentTrack.audioUrl;
        audio.load();
      } else {
        audio.currentTime = 0;
      }

      lastQueueIdRef.current = currentTrack.queueId;
      syncProgress(0, currentTrack.duration);
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, setPlaying, syncProgress]);

  if (!currentTrack) {
    return (
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 w-[min(1100px,calc(100vw-2rem))] -translate-x-1/2 rounded-[30px] border border-white/8 bg-[rgba(7,12,19,0.88)] px-6 py-5 text-sm text-[color:var(--muted-foreground)] shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-md">
        Pick a track from an album, artist page, search result, or playlist to
        start playback.
      </div>
    );
  }

  const progressValue = Math.min(currentTime, duration || 0);
  const volumeValue = isMuted ? 0 : volume;

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[min(1100px,calc(100vw-2rem))] -translate-x-1/2 rounded-[30px] border border-white/8 bg-[rgba(7,12,19,0.94)] px-4 py-4 shadow-[0_18px_54px_rgba(0,0,0,0.28)] backdrop-blur-md md:px-6">
      <audio
        onEnded={() => {
          if (!audioRef.current) {
            return;
          }

          if (repeatMode === "one") {
            audioRef.current.currentTime = 0;
            syncProgress(0, Math.max(duration, currentTrack.duration));
            void audioRef.current.play().catch(() => {
              setPlaying(false);
            });
            return;
          }

          nextTrack(true);
        }}
        onLoadedMetadata={(event) => {
          syncProgress(
            0,
            Math.round(event.currentTarget.duration || currentTrack.duration),
          );
        }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onTimeUpdate={(event) => {
          syncProgress(
            Math.round(event.currentTarget.currentTime),
            Math.round(event.currentTarget.duration || duration),
          );
        }}
        ref={audioRef}
        src={currentTrack.audioUrl}
      />

      <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)_220px] md:items-center">
        <div className="flex items-center gap-4">
          <Artwork
            className="h-16 w-16 shrink-0 rounded-[22px]"
            seed={currentTrack.queueId}
            title={currentTrack.title}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {currentTrack.title}
            </p>
            <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)]">
              {currentTrack.artist.name} • {currentTrack.album.title}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              Queue of {activePlaylist.length}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-1">
            <Button
              aria-label={shuffleEnabled ? "Disable shuffle" : "Enable shuffle"}
              className={cn(
                shuffleEnabled &&
                  "bg-white/10 text-white hover:bg-white/14",
              )}
              onClick={toggleShuffle}
              size="icon"
              variant="ghost"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Previous track"
              onClick={() => {
                if (!audioRef.current) {
                  previousTrack();
                  return;
                }

                if (currentTime > 4) {
                  audioRef.current.currentTime = 0;
                  syncProgress(0, Math.max(duration, currentTrack.duration));
                  return;
                }

                previousTrack();
              }}
              size="icon"
              variant="ghost"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              aria-label={isPlaying ? "Pause playback" : "Play playback"}
              onClick={togglePlayback}
              size="icon"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              aria-label="Next track"
              onClick={() => nextTrack()}
              size="icon"
              variant="ghost"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              aria-label={
                repeatMode === "off"
                  ? "Enable repeat all"
                  : repeatMode === "all"
                    ? "Enable repeat one"
                    : "Disable repeat"
              }
              className={cn(
                repeatMode !== "off" &&
                  "bg-white/10 text-white hover:bg-white/14",
              )}
              onClick={cycleRepeatMode}
              size="icon"
              variant="ghost"
            >
              {repeatMode === "one" ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-10 text-right text-xs text-[color:var(--muted-foreground)]">
              {formatDuration(progressValue)}
            </span>
            <input
              aria-label="Playback progress"
              className="h-1.5 flex-1 accent-[color:var(--accent)]"
              max={Math.max(duration, 1)}
              min={0}
              onChange={(event) => {
                if (!audioRef.current) {
                  return;
                }

                const nextTime = Number(event.target.value);
                audioRef.current.currentTime = nextTime;
                syncProgress(nextTime, duration);
              }}
              type="range"
              value={progressValue}
            />
            <span className="w-10 text-xs text-[color:var(--muted-foreground)]">
              {formatDuration(Math.max(duration, 0))}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          <Button
            aria-label={isMuted ? "Unmute" : "Mute"}
            onClick={toggleMute}
            size="icon"
            variant="ghost"
          >
            {isMuted || volumeValue === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <input
            aria-label="Volume"
            className="h-1.5 w-28 accent-[color:var(--accent)]"
            max={1}
            min={0}
            onChange={(event) => setVolume(Number(event.target.value))}
            step={0.01}
            type="range"
            value={volumeValue}
          />
        </div>
      </div>
    </div>
  );
}
