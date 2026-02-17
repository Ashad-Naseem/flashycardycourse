import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decks)
    .where(eq(decks.userId, userId))
    .orderBy(desc(decks.createdAt));
}

export async function getDeckById(deckId: number, userId: string) {
  return await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .limit(1);
}

export async function getDeckWithCards(deckId: number, userId: string) {
  // First verify the deck belongs to the user
  const userDecks = await db
    .select()
    .from(decks)
    .where(and(
      eq(decks.id, deckId),
      eq(decks.userId, userId)
    ));
  
  if (userDecks.length === 0) {
    return null;
  }

  // Then get the deck with its cards
  const deckCards = await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deckId));

  return {
    deck: userDecks[0],
    cards: deckCards
  };
}

export async function createDeck(userId: string, data: { name: string; description?: string }) {
  return await db
    .insert(decks)
    .values({
      userId,
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
}

export async function updateDeck(deckId: number, userId: string, data: Partial<{ name: string; description: string }>) {
  return await db
    .update(decks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .returning();
}

export async function deleteDeck(deckId: number, userId: string) {
  // Due to the foreign key constraint with onDelete: "cascade" in the schema,
  // all associated cards will be automatically deleted when the deck is deleted
  return await db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .returning();
}