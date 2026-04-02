import type * as React from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { PlayerBar } from "@/components/player/player-bar";
import { getCurrentViewer, getUserPlaylists } from "@/lib/music-service";
import { getSpotifyImportState } from "@/lib/spotify";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getCurrentViewer();
  const playlists = viewer.user ? await getUserPlaylists(viewer.user.id) : [];
  const spotify = viewer.user ? await getSpotifyImportState() : {
    available: false,
    connected: false,
    playlists: [],
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1560px] flex-col gap-4 px-3 py-3 md:px-6 md:py-6 lg:flex-row">
        <AppSidebar playlists={playlists} spotify={spotify} viewer={viewer} />
        <main className="min-w-0 flex-1 rounded-[36px] border border-white/10 bg-[rgba(8,15,25,0.72)] p-4 pb-40 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-md md:p-6 md:pb-44">
          {children}
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
