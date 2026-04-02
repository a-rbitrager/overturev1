"use client";

import { MinusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { removeTrackFromPlaylist } from "@/actions/playlists";
import { Button } from "@/components/ui/button";

export function RemoveTrackButton({
  playlistId,
  playlistTrackId,
}: {
  playlistId: string;
  playlistTrackId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      disabled={pending}
      onClick={() => {
        setPending(true);
        startTransition(async () => {
          try {
            await removeTrackFromPlaylist(playlistId, playlistTrackId);
            toast.success("Track removed.");
            router.refresh();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Could not remove track.",
            );
          } finally {
            setPending(false);
          }
        });
      }}
      size="icon"
      variant="ghost"
    >
      <MinusCircle className="h-4 w-4" />
    </Button>
  );
}
