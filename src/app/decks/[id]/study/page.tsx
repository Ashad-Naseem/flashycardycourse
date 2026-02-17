import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { StudyInterface } from "./components/study-interface";

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const resolvedParams = await params;
  const deckId = parseInt(resolvedParams.id);
  
  if (isNaN(deckId)) {
    notFound();
  }

  // Fetch deck and cards data using helper functions
  const [deckData, cardsData] = await Promise.all([
    getDeckById(deckId, userId),
    getCardsByDeckId(deckId, userId)
  ]);

  if (!deckData || deckData.length === 0) {
    notFound();
  }

  // Redirect to deck page if no cards
  if (cardsData.length === 0) {
    redirect(`/decks/${deckId}`);
  }

  const deck = deckData[0];
  const cards = cardsData;

  return (
    <StudyInterface
      deckId={deckId}
      deckName={deck.name}
      cards={cards}
    />
  );
}