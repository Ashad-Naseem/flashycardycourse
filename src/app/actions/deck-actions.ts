"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createDeck, updateDeck, deleteDeck, getUserDecks } from "@/db/queries/decks";
import { revalidatePath } from "next/cache";

const CreateDeckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(100, "Deck name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional()
});

const UpdateDeckSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Deck name is required").max(100, "Deck name must be less than 100 characters").optional(),
  description: z.string().max(500, "Description must be less than 500 characters").optional()
});

const DeleteDeckSchema = z.object({
  id: z.number()
});

export async function createDeckAction(data: z.infer<typeof CreateDeckSchema>) {
  const { userId, has } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = CreateDeckSchema.parse(data);
  
  // Check if user can create unlimited decks (Pro feature)
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  
  if (!hasUnlimitedDecks) {
    // Free users are limited to 3 decks
    try {
      const userDecks = await getUserDecks(userId);
      if (userDecks.length >= 3) {
        return {
          success: false,
          error: "Free users are limited to 3 decks. Upgrade to Pro for unlimited decks."
        };
      }
    } catch (error) {
      console.error("Failed to check deck limit:", error);
      return {
        success: false,
        error: "Failed to check deck limit. Please try again."
      };
    }
  }
  
  try {
    const newDeck = await createDeck(userId, validatedData);
    
    revalidatePath("/dashboard");
    
    return {
      success: true,
      deck: newDeck[0]
    };
  } catch (error) {
    console.error("Failed to create deck:", error);
    return {
      success: false,
      error: "Failed to create deck. Please try again."
    };
  }
}

export async function updateDeckAction(data: z.infer<typeof UpdateDeckSchema>) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { id, ...updateData } = UpdateDeckSchema.parse(data);
  
  try {
    const updatedDeck = await updateDeck(id, userId, updateData);
    
    if (updatedDeck.length === 0) {
      return {
        success: false,
        error: "Deck not found or you don't have permission to update it."
      };
    }
    
    revalidatePath("/dashboard");
    revalidatePath(`/decks/${id}`);
    
    return {
      success: true,
      deck: updatedDeck[0]
    };
  } catch (error) {
    console.error("Failed to update deck:", error);
    return {
      success: false,
      error: "Failed to update deck. Please try again."
    };
  }
}

export async function deleteDeckAction(data: z.infer<typeof DeleteDeckSchema>) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { id } = DeleteDeckSchema.parse(data);
  
  try {
    const deletedDeck = await deleteDeck(id, userId);
    
    if (deletedDeck.length === 0) {
      return {
        success: false,
        error: "Deck not found or you don't have permission to delete it."
      };
    }
    
    revalidatePath("/dashboard");
    revalidatePath(`/decks/${id}`);
    
    return {
      success: true,
      deck: deletedDeck[0]
    };
  } catch (error) {
    console.error("Failed to delete deck:", error);
    return {
      success: false,
      error: "Failed to delete deck. Please try again."
    };
  }
}