import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const decks = pgTable("decks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const cards = pgTable("cards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer().references(() => decks.id, { onDelete: "cascade" }).notNull(),
  front: text().notNull(), // The question/prompt side
  back: text().notNull(),  // The answer side
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});