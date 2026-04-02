"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { deletePlaylist } from "@/actions/playlists";
import { Button } from "@/components/ui/button";

export function DeletePlaylistButton({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      disabled={pending}
      onClick={() => {
        const confirmed = window.confirm(
          "Delete this playlist? The track list will be removed from your library.",
        );

        if (!confirmed) {
          return;
        }

        setPending(true);
        startTransition(async () => {
          try {
            await deletePlaylist(playlistId);
            toast.success("Playlist deleted.");
            router.push("/");
            router.refresh();
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Could not delete playlist.",
            );
          } finally {
            setPending(false);
          }
        });
      }}
      variant="danger"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {pending ? "Deleting..." : "Delete playlist"}
    </Button>
  );
}
