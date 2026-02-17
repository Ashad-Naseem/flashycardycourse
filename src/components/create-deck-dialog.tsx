"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createDeckAction } from "@/app/actions/deck-actions";

interface CreateDeckDialogProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function CreateDeckDialog({ 
  variant = "default", 
  size = "default", 
  className = "",
  children
}: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    try {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      
      const result = await createDeckAction({
        name: name.trim(),
        description: description.trim() || undefined
      });
      
      if (result.success) {
        setOpen(false);
        // Reset form is handled by closing the dialog
      } else {
        setError(result.error || "Failed to create deck");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Create deck error:", err);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {children || (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Deck
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Create a new flashcard deck to organize your learning materials.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Deck Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter deck name..."
              required
              maxLength={100}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what this deck is about..."
              maxLength={500}
              disabled={isLoading}
              rows={3}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Deck"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}