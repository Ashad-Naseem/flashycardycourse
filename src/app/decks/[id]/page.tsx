import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId as getCardsQuery } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, ArrowLeft, BookOpen, Edit, Trash2, Play } from "lucide-react";
import { AddCardForm } from "./components/add-card-form";
import { EditCardForm } from "./components/edit-card-form";
import { DeleteCardDialog } from "./components/delete-card-dialog";
import { EditDeckForm } from "./components/edit-deck-form";
import { DeleteDeckDialog } from "./components/delete-deck-dialog";
import { StudySession } from "./components/study-session";
import { AIGenerateCardsButton } from "@/components/ai-generate-cards-button";

interface DeckPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
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
    getCardsQuery(deckId, userId)
  ]);

  if (!deckData || deckData.length === 0) {
    notFound();
  }

  const deck = deckData[0];
  const cards = cardsData;

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{deck.name}</h1>
                <Badge variant="secondary">
                  {cards.length} {cards.length === 1 ? 'Card' : 'Cards'}
                </Badge>
              </div>
              {deck.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {deck.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Created {new Date(deck.createdAt).toLocaleDateString()} • 
                Updated {new Date(deck.updatedAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <EditDeckForm deck={deck} />
              <DeleteDeckDialog 
                deckId={deckId} 
                deckName={deck.name} 
                cardCount={cards.length} 
              />
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cards</h2>
          
          {cards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first flashcard to start learning
                </p>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <AddCardForm deckId={deckId} />
                  <div className="text-muted-foreground text-sm">or</div>
                  <AIGenerateCardsButton 
                    deckId={deckId} 
                    deckName={deck.name}
                    deckDescription={deck.description || undefined}
                    size="default"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Study Options */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href={`/decks/${deckId}/study`}>
                      <Play className="h-4 w-4 mr-2" />
                      Full Study Mode
                    </Link>
                  </Button>
                  <StudySession 
                    cards={cards}
                    deckName={deck.name}
                    randomOrder={false}
                  />
                  <StudySession 
                    cards={cards}
                    deckName={deck.name}
                    randomOrder={true}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <AddCardForm deckId={deckId} />
                  <AIGenerateCardsButton 
                    deckId={deckId} 
                    deckName={deck.name}
                    deckDescription={deck.description || undefined}
                  />
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <Card key={card.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">
                          {card.front}
                        </CardTitle>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <EditCardForm card={card} deckId={deckId} />
                          <DeleteCardDialog cardId={card.id} deckId={deckId} cardFront={card.front} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="line-clamp-3">
                        {card.back}
                      </CardDescription>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Created {new Date(card.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}