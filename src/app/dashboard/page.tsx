import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDecks } from "@/db/queries/decks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Protect } from "@clerk/nextjs";
import Link from "next/link";
import { BookOpen, Shield } from "lucide-react";
import { CreateDeckDialog } from "@/components/create-deck-dialog";

// Prominent deck limit alert banner
function DeckLimitAlert() {
  return (
    <Alert className="bg-slate-900 text-white border-slate-700 mb-8">
      <Shield className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-medium">You&apos;ve reached the limit of 3 decks on the free plan.</span>
          <Button 
            variant="link" 
            size="sm" 
            className="text-blue-400 hover:text-blue-300 p-0 ml-2 h-auto"
            asChild
          >
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
          <span className="ml-1">to create unlimited decks.</span>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Plan status and deck counter for header
function PlanStatus({ currentCount, hasUnlimitedDecks, hasProPlan }: { 
  currentCount: number; 
  hasUnlimitedDecks: boolean;
  hasProPlan: boolean;
}) {
  if (hasProPlan) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-green-600 text-white">
          Pro Plan
        </Badge>
        <span className="text-sm text-muted-foreground">
          {currentCount} deck{currentCount !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline">Free Plan</Badge>
      <span className="text-sm text-muted-foreground">{currentCount}/3 decks</span>
    </div>
  );
}

export default async function DashboardPage() {
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }
  
  const userDecks = await getUserDecks(userId);
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const hasProPlan = has({ plan: "pro" });
  const isAtDeckLimit = !hasUnlimitedDecks && userDecks.length >= 3;
  
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your flashcard decks and study progress
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <PlanStatus 
              currentCount={userDecks.length} 
              hasUnlimitedDecks={hasUnlimitedDecks}
              hasProPlan={hasProPlan}
            />
            <Protect
              feature="unlimited_decks"
              fallback={
                isAtDeckLimit ? (
                  <Button disabled variant="outline">
                    Create Deck
                  </Button>
                ) : (
                  <CreateDeckDialog />
                )
              }
            >
              <CreateDeckDialog />
            </Protect>
          </div>
        </div>

        {/* Deck Limit Alert Banner */}
        {isAtDeckLimit && (
          <DeckLimitAlert />
        )}

        {/* Decks Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Decks</h2>
          
          {userDecks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first flashcard deck to start learning
                </p>
                <CreateDeckDialog>Create Your First Deck</CreateDeckDialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userDecks.map((deck) => (
                <Link key={deck.id} href={`/decks/${deck.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{deck.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {deck.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Updated {new Date(deck.updatedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}