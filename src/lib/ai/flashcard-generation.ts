import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const FlashcardSchema = z.object({
  front: z.string().min(1, "Front content is required"),
  back: z.string().min(1, "Back content is required")
});

const FlashcardArraySchema = z.object({
  flashcards: z.array(FlashcardSchema).min(1, "At least one flashcard required")
});

type ContentType = 'language' | 'academic' | 'vocabulary' | 'general';

function detectContentType(topic: string, description: string): ContentType {
  const combined = (topic + ' ' + description).toLowerCase();
  
  // Very specific language learning indicators - must be explicit
  const languagePatterns = [
    // Direct language-to-language translations
    /english\s+to\s+\w+/,
    /\w+\s+to\s+english/,
    /learning\s+(spanish|french|german|italian|portuguese|chinese|japanese|korean|arabic|hindi|russian|indonesian|dutch|swedish|norwegian|polish|turkish|hebrew|thai|vietnamese)/,
    /(spanish|french|german|italian|portuguese|chinese|japanese|korean|arabic|hindi|russian|indonesian|dutch|swedish|norwegian|polish|turkish|hebrew|thai|vietnamese)\s+(translation|vocabulary|phrases|words)/,
    /translate\s+\w+/,
    /\w+\s+translation/
  ];
  
  // Only trigger language mode with very specific patterns
  if (languagePatterns.some(pattern => pattern.test(combined))) {
    return 'language';
  }
  
  // Very specific vocabulary/terminology indicators
  const vocabularyPatterns = [
    /medical\s+terminology/,
    /technical\s+terms/,
    /glossary\s+of/,
    /\w+\s+definitions/,
    /terminology\s+for/
  ];
  
  if (vocabularyPatterns.some(pattern => pattern.test(combined))) {
    return 'vocabulary';
  }
  
  // Only use academic mode for very clear academic subjects
  const academicKeywords = [
    'anatomy', 'biochemistry', 'calculus', 'organic chemistry', 'physics equations',
    'historical dates', 'literary analysis', 'psychological concepts', 'legal terms'
  ];
  
  if (academicKeywords.some(keyword => combined.includes(keyword))) {
    return 'academic';
  }
  
  return 'general';
}

function buildPrompt(topic: string, description: string, count: number, contentType: ContentType): string {
  const contextInfo = description ? `\nContext: ${description}` : '';
  
  switch (contentType) {
    case 'language':
      return `Generate exactly ${count} flashcards for language learning: "${topic}".${contextInfo}

Create simple, direct translation cards for language practice.

Requirements:
- Front: Words, phrases, or sentences in the source language
- Back: Direct translation in the target language
- Keep translations accurate and concise
- Focus on useful, common vocabulary and expressions
- Mix different types: everyday words, useful phrases, essential expressions
- Avoid verbose explanations - keep it simple and practical

Examples:
Front: "Hello" → Back: "Hola"
Front: "Thank you" → Back: "Merci"
Front: "Where is...?" → Back: "¿Dónde está...?"

Create practical cards for language practice and memorization.`;

    case 'vocabulary':
      return `Generate exactly ${count} vocabulary flashcards for "${topic}".${contextInfo}

Requirements:
- Front: Key term, word, or concept
- Back: Clear, concise definition or explanation
- Focus on essential terminology and important concepts
- Keep definitions accurate and memorable
- Include the most relevant terms for effective learning

Create practical term/definition pairs for vocabulary mastery.`;

    case 'academic':
      return `Generate exactly ${count} study flashcards for the academic subject "${topic}".${contextInfo}

Requirements:
- Front: Clear questions or prompts that test key concepts
- Back: Accurate answers with essential information and brief explanations
- Focus on the most important concepts, facts, and principles
- Include variety: definitions, examples, applications, relationships
- Make content appropriate for academic study and exam preparation
- Cover different aspects of the subject systematically

Create comprehensive flashcards suitable for academic learning and assessment.`;

    default:
      return `Generate exactly ${count} effective study flashcards for "${topic}".${contextInfo}

Create flashcards that are most appropriate for this subject matter. Analyze the topic and context to determine the best format:

- For factual/conceptual learning: Use clear questions with informative answers
- For vocabulary/definitions: Use term → definition format  
- For language elements: Use direct translations or simple practice pairs
- For procedures/processes: Use step-by-step or cause-effect format

Requirements:
- Choose the most effective front/back format for this specific content
- Keep information clear, accurate, and focused on key learning points
- Make cards practical for study and memorization
- Ensure appropriate difficulty level
- Cover the most important aspects of the topic

Adapt your approach based on what would be most useful for someone studying this topic.`;
  }
}

export async function generateFlashcards(topic: string, description?: string, count: number = 20) {
  try {
    const contextInfo = description ? `\nContext: ${description}` : '';
    
    // Detect content type based on topic and description
    const contentType = detectContentType(topic, description || '');
    const prompt = buildPrompt(topic, description || '', count, contentType);
    
    const { output } = await generateText({
      model: openai("gpt-4o-mini"), // Use cost-effective model
      output: Output.object({
        schema: FlashcardArraySchema,
      }),
      prompt,
      maxRetries: 2, // Built-in retry mechanism
    });

    // Validate output meets minimum quality
    if (output.flashcards.length < Math.min(count, 1)) {
      throw new Error("Generated insufficient flashcards");
    }

    return output.flashcards;
  } catch (error) {
    console.error('Flashcard generation error:', error);
    
    if (error instanceof Error) {
      // Handle quota exceeded
      if (error.message?.includes('quota') || error.message?.includes('insufficient_quota')) {
        throw new Error("AI service quota exceeded. Please try again later or contact support.");
      }
      
      // Handle rate limiting
      if (error.message?.includes('rate limit')) {
        throw new Error("AI service is temporarily unavailable due to high demand. Please try again in a few minutes.");
      }
      
      // Handle content policy violations
      if (error.message?.includes('content policy')) {
        throw new Error("Unable to generate content for this topic. Please try a different subject.");
      }
      
      // Handle authentication issues
      if (error.message?.includes('authentication') || error.message?.includes('api key')) {
        throw new Error("AI service configuration error. Please contact support.");
      }
    }
    
    throw new Error("Failed to generate flashcards. Please try again later.");
  }
}