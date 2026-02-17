"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { deleteDeckAction } from "@/app/actions/deck-actions";
import { useRouter } from "next/navigation";

interface DeleteDeckDialogProps {
  deckId: number;
  deckName: string;
  cardCount: number;
}

export function DeleteDeckDialog({ deckId, deckName, cardCount }: DeleteDeckDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    
    try {
      const result = await deleteDeckAction({
        id: deckId,
      });

      if (result.success) {
        // Navigate back to dashboard after successful deletion
        router.push("/dashboard");
      } else {
        console.error("Failed to delete deck:", result.error);
      }
    } catch (error) {
      console.error("Error deleting deck:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Deck
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Deck</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this deck? This action cannot be undone.
            <br />
            <br />
            <strong>Deck:</strong> {deckName}
            <br />
            <strong>Cards:</strong> {cardCount} {cardCount === 1 ? 'card' : 'cards'} will also be deleted
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Deck
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}