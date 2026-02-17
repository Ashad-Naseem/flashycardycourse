"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { generateFlashcards } from "@/lib/ai/flashcard-generation";
import { createCard } from "@/db/queries/cards";
import { getDeckById } from "@/db/queries/decks";
import { revalidatePath } from "next/cache";

const GenerateCardsSchema = z.object({
  deckId: z.number(),
  count: z.number().min(1).max(20).default(20)
});

export async function generateCardsWithAIAction(data: z.infer<typeof GenerateCardsSchema>) {
  const { userId, has } = await auth();
  
  if (!userId) {
    return {
      success: false,
      error: "You must be logged in to generate cards."
    };
  }

  // Check Pro plan requirement for AI generation
  const hasAIGeneration = has({ feature: "ai_flashcard_generation" });
  if (!hasAIGeneration) {
    return {
      success: false,
      error: "AI flashcard generation requires a Pro subscription.",
      requiresUpgrade: true
    };
  }

  const { deckId, count } = GenerateCardsSchema.parse(data);
  
  try {
    // Get deck information for AI context
    const deckData = await getDeckById(deckId, userId);
    if (!deckData || deckData.length === 0) {
      return {
        success: false,
        error: "Deck not found or you don't have permission to access it."
      };
    }

    const deck = deckData[0];
    
    // Validate that deck has description - required for quality AI generation
    if (!deck.description || deck.description.trim().length === 0) {
      return {
        success: false,
        error: "Deck description is required for AI generation. Please add a description to help create more relevant flashcards."
      };
    }
    
    // Generate flashcards using AI
    const generatedCards = await generateFlashcards(
      deck.name,
      deck.description || undefined,
      count
    );
    
    // Save generated cards to database using helper functions
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const card of generatedCards) {
      try {
        const newCard = await createCard(userId, {
          deckId,
          front: card.front,
          back: card.back,
        });
        results.push(newCard[0]);
        successCount++;
      } catch (error) {
        console.error('Failed to save generated card:', error);
        failureCount++;
      }
    }

    // Revalidate the deck page to show new cards
    revalidatePath(`/decks/${deckId}`);

    if (successCount === 0) {
      return {
        success: false,
        error: "Failed to save any generated cards. Please try again."
      };
    }

    return {
      success: true,
      cards: results,
      message: failureCount > 0 
        ? `Generated ${successCount} cards successfully. ${failureCount} cards failed to save.`
        : `Successfully generated ${successCount} cards using AI!`
    };
    
  } catch (error) {
    console.error('AI generation failed:', error);
    
    if (error instanceof Error) {
      // Provide specific error messages for different scenarios
      let errorMessage = error.message;
      
      if (error.message.includes('quota')) {
        errorMessage = "AI generation is temporarily unavailable due to service limits. Please try again later.";
      } else if (error.message.includes('rate limit')) {
        errorMessage = "AI service is busy. Please wait a few minutes and try again.";
      } else if (error.message.includes('authentication') || error.message.includes('api key')) {
        errorMessage = "AI service is temporarily unavailable. Please contact support if this persists.";
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    return {
      success: false,
      error: "AI generation failed. Please try again later."
    };
  }
}