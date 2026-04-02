"use client";

import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { createPlaylist } from "@/actions/playlists";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreatePlaylistDialog({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="icon" variant="secondary">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create playlist</DialogTitle>
          <DialogDescription>
            Start with a name, then add tracks from albums, search, or another
            playlist.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white">Playlist name</label>
            <Input
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="After Hours Drive"
              value={name}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white">Description</label>
            <Textarea
              maxLength={160}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Late-night songs for highways and wet pavement."
              value={description}
            />
          </div>
          <Button
            className="w-full"
            disabled={pending || name.trim().length < 2}
            onClick={() => {
              setPending(true);
              startTransition(async () => {
                try {
                  const playlist = await createPlaylist(
                    userId,
                    name.trim(),
                    description.trim(),
                  );
                  toast.success("Playlist created.");
                  setOpen(false);
                  reset();
                  router.push(`/playlist/${playlist.id}`);
                  router.refresh();
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Could not create playlist.",
                  );
                } finally {
                  setPending(false);
                }
              });
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {pending ? "Creating..." : "Create playlist"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
