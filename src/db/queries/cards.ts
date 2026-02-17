import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getCardsByDeckId(deckId: number, userId: string) {
  return await db
    .select({
      id: cards.id,
      front: cards.front,
      back: cards.back,
      createdAt: cards.createdAt,
      updatedAt: cards.updatedAt,
      deckName: decks.name
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(
      eq(cards.deckId, deckId),
      eq(decks.userId, userId)
    ))
    .orderBy(desc(cards.updatedAt));
}

export async function getCardById(cardId: number, userId: string) {
  return await db
    .select({
      id: cards.id,
      front: cards.front,
      back: cards.back,
      deckId: cards.deckId,
      createdAt: cards.createdAt,
      updatedAt: cards.updatedAt,
      deckName: decks.name
    })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(
      eq(cards.id, cardId),
      eq(decks.userId, userId)
    ))
    .limit(1);
}

export async function createCard(userId: string, data: {
  deckId: number;
  front: string;
  back: string;
}) {
  // Verify deck ownership first
  const deck = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, data.deckId), eq(decks.userId, userId)))
    .limit(1);
    
  if (!deck.length) throw new Error("Deck not found");
  
  return await db
    .insert(cards)
    .values({
      deckId: data.deckId,
      front: data.front,
      back: data.back,
      // Let database handle timestamps with defaultNow()
    })
    .returning();
}

export async function updateCard(cardId: number, userId: string, data: Partial<{
  front: string;
  back: string;
}>) {
  // Verify card belongs to user's deck
  const cardCheck = await db
    .select({ cardId: cards.id })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(
      eq(cards.id, cardId),
      eq(decks.userId, userId)
    ))
    .limit(1);
    
  if (!cardCheck.length) throw new Error("Card not found");
  
  return await db
    .update(cards)
    .set({ ...data, updatedAt: sql`NOW()` })
    .where(eq(cards.id, cardId))
    .returning();
}

export async function deleteCard(cardId: number, userId: string) {
  // Verify card belongs to user's deck
  const cardCheck = await db
    .select({ cardId: cards.id })
    .from(cards)
    .innerJoin(decks, eq(cards.deckId, decks.id))
    .where(and(
      eq(cards.id, cardId),
      eq(decks.userId, userId)
    ))
    .limit(1);
    
  if (!cardCheck.length) throw new Error("Card not found");
  
  return await db
    .delete(cards)
    .where(eq(cards.id, cardId))
    .returning();
}

export async function deleteCardsByDeckId(deckId: number, userId: string) {
  // Verify deck ownership first
  const deck = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .limit(1);
    
  if (!deck.length) throw new Error("Deck not found");
  
  return await db
    .delete(cards)
    .where(eq(cards.deckId, deckId))
    .returning();
}