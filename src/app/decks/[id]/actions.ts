"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCard, updateCard, deleteCard } from "@/db/queries/cards";
import { updateDeck, deleteDeck } from "@/db/queries/decks";

// Schemas for validation
const CreateCardSchema = z.object({
  deckId: z.number(),
  front: z.string().min(1, "Front side is required").max(1000, "Front side is too long"),
  back: z.string().min(1, "Back side is required").max(1000, "Back side is too long"),
});

const UpdateCardSchema = z.object({
  cardId: z.number(),
  deckId: z.number(),
  front: z.string().min(1, "Front side is required").max(1000, "Front side is too long"),
  back: z.string().min(1, "Back side is required").max(1000, "Back side is too long"),
});

const UpdateDeckSchema = z.object({
  deckId: z.number(),
  name: z.string().min(1, "Deck name is required").max(255, "Deck name is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
});

const DeleteCardSchema = z.object({
  cardId: z.number(),
  deckId: z.number(),
});

const DeleteDeckSchema = z.object({
  deckId: z.number(),
});

// Card Actions
export async function createCardAction(data: z.infer<typeof CreateCardSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedData = CreateCardSchema.parse(data);

  try {
    await createCard(userId, {
      deckId: validatedData.deckId,
      front: validatedData.front,
      back: validatedData.back,
    });

    revalidatePath(`/decks/${validatedData.deckId}`);
    return { success: true, message: "Card created successfully" };
  } catch (error) {
    throw new Error("Failed to create card");
  }
}

export async function updateCardAction(data: z.infer<typeof UpdateCardSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedData = UpdateCardSchema.parse(data);

  try {
    await updateCard(validatedData.cardId, userId, {
      front: validatedData.front,
      back: validatedData.back,
    });

    revalidatePath(`/decks/${validatedData.deckId}`);
    return { success: true, message: "Card updated successfully" };
  } catch (error) {
    throw new Error("Failed to update card");
  }
}

export async function deleteCardAction(data: z.infer<typeof DeleteCardSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedData = DeleteCardSchema.parse(data);

  try {
    await deleteCard(validatedData.cardId, userId);

    revalidatePath(`/decks/${validatedData.deckId}`);
    return { success: true, message: "Card deleted successfully" };
  } catch (error) {
    throw new Error("Failed to delete card");
  }
}

// Deck Actions
export async function updateDeckAction(data: z.infer<typeof UpdateDeckSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedData = UpdateDeckSchema.parse(data);

  try {
    await updateDeck(validatedData.deckId, userId, {
      name: validatedData.name,
      description: validatedData.description,
    });

    revalidatePath(`/decks/${validatedData.deckId}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Deck updated successfully" };
  } catch (error) {
    throw new Error("Failed to update deck");
  }
}

export async function deleteDeckAction(data: z.infer<typeof DeleteDeckSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedData = DeleteDeckSchema.parse(data);

  try {
    await deleteDeck(validatedData.deckId, userId);

    revalidatePath("/dashboard");
    redirect("/dashboard");
  } catch (error) {
    throw new Error("Failed to delete deck");
  }
}