"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus,Minus } from "lucide-react";
import { toast } from "sonner";
import { Playlist } from "@prisma/client";
export const dynamic = "force-dynamic";

const AddToPlaylistModal = ({ isOpen, onClose, onSubmit, onRemove, problemId}:any) => {
  const [playlists, setPlaylists] = useState<(
  Playlist & { problems?: { problemId: string }[] }
)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // playlists may include relation `problemsPlaylists` from the API

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const response = await fetch('/api/playlists');
        const data = await response.json();
        if (data.success) {
          setPlaylists(data.playlists);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
        toast.error("Failed to load playlists");
      }
    };

    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const handleAddToPlaylist = async (playlistId:string) => {
    try {
      setIsLoading(true);
      await onSubmit(problemId, playlistId);
      setPlaylists((prevPlaylists) =>
      prevPlaylists.map((p) =>
      p.id === playlistId
        ? { ...p, problems: [...(p.problems || []), { problemId }] }
        : p
    )
  );if (onSubmit) onSubmit(problemId, playlistId);
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
      toast.error("Failed to add problem to playlist");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveFromPlaylist = async (playlistId: string) => {
  try {
    setIsLoading(true);
    await onRemove(problemId, playlistId); // Call the remove function passed from the parent
    // You can choose to call onClose() here, or leave it open if the user wants to remove it from multiple playlists
    setPlaylists((prevPlaylists) =>
    prevPlaylists.map((p) =>
      p.id === playlistId
        ? { ...p, problems: p.problems?.filter((prob) => prob.problemId !== problemId) }
        : p
    )
  );if (onRemove) onRemove(problemId, playlistId);
    onClose(); 
  } catch (error) {
    console.error('Error removing from playlist:', error);
    toast.error("Failed to remove problem from playlist");
  } finally {
    setIsLoading(false);
  }
};

return (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add to Playlist</DialogTitle>
        <DialogDescription>
          Choose a playlist to add this problem to
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[300px] w-full pr-4">
        {playlists.length > 0 ? (
          <div className="space-y-2">
            {playlists.map((playlist) => {
              // Calculate isAdded for each playlist in the list
              console.log(`Playlist: ${playlist.name}`, playlist.problems);
              console.log(`Comparing DB problemId:`, playlist.problems?.[0]?.problemId, `with Modal problemId:`, problemId);
              const isAdded = playlist.problems?.some((p: any) => p.problemId === problemId);

              return (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent"
                >
                  {/* Playlist Info */}
                  <div>
                    <h3 className="font-medium">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground">
                        {playlist.description}
                      </p>
                    )}
                  </div>

                  {/* Dynamic Add/Remove Button */}
                  <Button
                    size="sm"
                    variant={isAdded ? "destructive" : "default"}
                    onClick={() => {
                      if (isAdded) {
                        handleRemoveFromPlaylist(playlist.id);
                      } else {
                        handleAddToPlaylist(playlist.id);
                      }
                    }}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isAdded ? (
                      <>
                        <Minus className="h-4 w-4" />
                        Remove
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>No playlists found. Create one first!</p>
            <Button
              className="mt-2"
              variant="outline"
              onClick={() => {
                onClose();
                // You can emit an event or use a callback here to open create playlist modal
              }}
            >
              Create Playlist
            </Button>
          </div>
        )}
      </ScrollArea>
    </DialogContent>
  </Dialog>
);
}

export default AddToPlaylistModal;