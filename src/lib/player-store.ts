"use client";

import { create } from "zustand";

import type { RepeatMode, TrackSummary } from "@/lib/types";

type PlayerStore = {
  activePlaylist: TrackSummary[];
  queueOrder: number[];
  currentTrack: TrackSummary | null;
  currentIndex: number;
  currentOrderIndex: number;
  isPlaying: boolean;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  setQueue: (tracks: TrackSummary[], queueId?: string) => void;
  playTrack: (track: TrackSummary, tracks: TrackSummary[]) => void;
  setPlaying: (isPlaying: boolean) => void;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  syncProgress: (currentTime: number, duration: number) => void;
  nextTrack: (fromEnded?: boolean) => void;
  previousTrack: () => void;
};

function buildSequentialOrder(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function shuffleIndices(indices: number[]) {
  const next = [...indices];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function buildQueueOrder(
  tracks: TrackSummary[],
  currentIndex: number,
  shuffleEnabled: boolean,
) {
  if (tracks.length === 0) {
    return [];
  }

  const sequential = buildSequentialOrder(tracks.length);

  if (!shuffleEnabled) {
    return sequential;
  }

  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const remaining = sequential.filter((index) => index !== safeIndex);

  return [safeIndex, ...shuffleIndices(remaining)];
}

function setActiveTrack(
  state: Pick<
    PlayerStore,
    "activePlaylist" | "queueOrder" | "currentIndex" | "currentOrderIndex"
  >,
  nextIndex: number,
  nextOrderIndex: number,
) {
  const nextTrack = state.activePlaylist[nextIndex] ?? null;

  return {
    currentTrack: nextTrack,
    currentIndex: nextTrack ? nextIndex : -1,
    currentOrderIndex: nextTrack ? nextOrderIndex : -1,
    currentTime: 0,
    duration: nextTrack?.duration ?? 0,
    isPlaying: Boolean(nextTrack),
  };
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  activePlaylist: [],
  queueOrder: [],
  currentTrack: null,
  currentIndex: -1,
  currentOrderIndex: -1,
  isPlaying: false,
  shuffleEnabled: false,
  repeatMode: "off",
  isMuted: false,
  volume: 0.72,
  currentTime: 0,
  duration: 0,
  setQueue: (tracks, queueId) => {
    const requestedIndex = queueId
      ? tracks.findIndex((track) => track.queueId === queueId)
      : 0;
    const currentIndex = requestedIndex >= 0 ? requestedIndex : 0;
    const shuffleEnabled = get().shuffleEnabled;
    const queueOrder = buildQueueOrder(tracks, currentIndex, shuffleEnabled);
    const currentOrderIndex = queueOrder.findIndex((index) => index === currentIndex);

    set({
      activePlaylist: tracks,
      queueOrder,
      ...setActiveTrack(
        {
          activePlaylist: tracks,
          queueOrder,
          currentIndex,
          currentOrderIndex,
        },
        currentIndex,
        currentOrderIndex >= 0 ? currentOrderIndex : tracks.length > 0 ? 0 : -1,
      ),
    });
  },
  playTrack: (track, tracks) => {
    const currentIndex = tracks.findIndex((item) => item.queueId === track.queueId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const shuffleEnabled = get().shuffleEnabled;
    const queueOrder = buildQueueOrder(tracks, safeIndex, shuffleEnabled);
    const currentOrderIndex = queueOrder.findIndex((index) => index === safeIndex);

    set({
      activePlaylist: tracks,
      queueOrder,
      ...setActiveTrack(
        {
          activePlaylist: tracks,
          queueOrder,
          currentIndex: safeIndex,
          currentOrderIndex,
        },
        safeIndex,
        currentOrderIndex >= 0 ? currentOrderIndex : tracks.length > 0 ? 0 : -1,
      ),
    });
  },
  setPlaying: (isPlaying) => set({ isPlaying }),
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) =>
    set({
      volume,
      isMuted: volume === 0 ? true : false,
    }),
  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),
  toggleShuffle: () =>
    set((state) => {
      const shuffleEnabled = !state.shuffleEnabled;
      const queueOrder = buildQueueOrder(
        state.activePlaylist,
        state.currentIndex,
        shuffleEnabled,
      );
      const currentOrderIndex = queueOrder.findIndex(
        (index) => index === state.currentIndex,
      );

      return {
        shuffleEnabled,
        queueOrder,
        currentOrderIndex:
          currentOrderIndex >= 0
            ? currentOrderIndex
            : state.activePlaylist.length > 0
              ? 0
              : -1,
      };
    }),
  cycleRepeatMode: () =>
    set((state) => ({
      repeatMode:
        state.repeatMode === "off"
          ? "all"
          : state.repeatMode === "all"
            ? "one"
            : "off",
    })),
  syncProgress: (currentTime, duration) => set({ currentTime, duration }),
  nextTrack: (fromEnded = false) => {
    const {
      activePlaylist,
      currentTrack,
      currentOrderIndex,
      queueOrder,
      repeatMode,
    } = get();

    if (activePlaylist.length === 0 || currentOrderIndex < 0) {
      return;
    }

    const nextOrderIndex = currentOrderIndex + 1;

    if (nextOrderIndex < queueOrder.length) {
      const nextIndex = queueOrder[nextOrderIndex] ?? -1;

      set((state) => ({
        ...setActiveTrack(state, nextIndex, nextOrderIndex),
      }));
      return;
    }

    if (repeatMode === "all" && queueOrder.length > 0) {
      const nextIndex = queueOrder[0] ?? -1;

      set((state) => ({
        ...setActiveTrack(state, nextIndex, 0),
      }));
      return;
    }

    set({
      currentTime: fromEnded ? 0 : get().currentTime,
      duration: currentTrack?.duration ?? get().duration,
      isPlaying: false,
    });
  },
  previousTrack: () => {
    const { activePlaylist, currentOrderIndex, queueOrder, repeatMode } = get();

    if (activePlaylist.length === 0 || currentOrderIndex < 0) {
      return;
    }

    if (currentOrderIndex > 0) {
      const previousOrderIndex = currentOrderIndex - 1;
      const previousIndex = queueOrder[previousOrderIndex] ?? -1;

      set((state) => ({
        ...setActiveTrack(state, previousIndex, previousOrderIndex),
      }));
      return;
    }

    if (repeatMode === "all" && queueOrder.length > 0) {
      const previousOrderIndex = queueOrder.length - 1;
      const previousIndex = queueOrder[previousOrderIndex] ?? -1;

      set((state) => ({
        ...setActiveTrack(state, previousIndex, previousOrderIndex),
      }));
    }
  },
}));
