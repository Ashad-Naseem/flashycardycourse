"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Protect } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateCardsWithAIAction } from "@/app/actions/card-actions";
import { Sparkles, Crown, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AIGenerateCardsButtonProps {
  deckId: number;
  deckName: string;
  deckDescription?: string;
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon" | null;
}

export function AIGenerateCardsButton({ deckId, deckName, deckDescription, disabled, size = "sm" }: AIGenerateCardsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasRecentError, setHasRecentError] = useState(false);
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <Button disabled size="sm" variant="outline">Loading...</Button>;
  }

  // Check if deck has description - required for AI generation
  const hasDescription = deckDescription && deckDescription.trim().length > 0;

  const handleGenerateCards = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateCardsWithAIAction({
        deckId,
        count: 20
      });

      if (result.success) {
        toast.success(result.message || "Cards generated successfully!");
        setHasRecentError(false); // Reset error state on success
      } else {
        if (result.requiresUpgrade) {
          // This shouldn't happen due to Protect component, but as fallback
          window.open('/pricing', '_blank');
        } else {
          // Show specific error messages for different scenarios
          const errorMessage = result.error || "Failed to generate cards";
          
          if (errorMessage.includes('quota') || errorMessage.includes('service limits')) {
            toast.error("AI service temporarily unavailable", {
              description: "Please try again later or contact support if this persists."
            });
            setHasRecentError(true);
            // Auto-reset error state after 5 minutes
            setTimeout(() => setHasRecentError(false), 5 * 60 * 1000);
          } else if (errorMessage.includes('rate limit') || errorMessage.includes('busy')) {
            toast.error("Service busy", {
              description: "Please wait a few minutes and try again."
            });
            setHasRecentError(true);
            // Auto-reset error state after 2 minutes
            setTimeout(() => setHasRecentError(false), 2 * 60 * 1000);
          } else {
            toast.error(errorMessage);
          }
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Missing description prompt component
  const MissingDescriptionPrompt = () => (
    <div className="relative group inline-block">
      <div className="cursor-not-allowed">
        <Button 
          variant="outline" 
          size={size || "sm"} 
          disabled
          className="relative pointer-events-none"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
          <AlertCircle className="h-3 w-3 ml-2 text-amber-500" />
        </Button>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <Card className="border-amber-200 bg-amber-50 shadow-lg">
          <CardContent className="p-3">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Description Required</span>
              </div>
              <p className="text-sm text-amber-700">
                Add a description to &ldquo;{deckName}&rdquo; to generate AI-powered flashcards. The description helps create more relevant and accurate cards.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Free user fallback component
  const FreeUserPrompt = () => (
    <div className="relative group inline-block">
      <div className="cursor-not-allowed">
        <Button 
          variant="outline" 
          size={size || "sm"} 
          disabled
          className="relative pointer-events-none"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
          <Crown className="h-3 w-3 ml-2 text-amber-500" />
        </Button>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <Card className="border-amber-200 bg-amber-50 shadow-lg">
          <CardContent className="p-3">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">Pro Feature</span>
              </div>
              <p className="text-sm text-amber-700">
                AI flashcard generation is available with a Pro subscription
              </p>
              <Button size="sm" asChild className="mt-2">
                <Link href="/pricing">
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Pro user component
  const ProUserButton = () => (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleGenerateCards}
        disabled={disabled || isGenerating || hasRecentError}
        size={size || "sm"}
        variant={hasRecentError ? "outline" : "default"}
        className={hasRecentError 
          ? "border-amber-300 text-amber-700" 
          : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        }
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : hasRecentError ? (
          <AlertCircle className="h-4 w-4 mr-2" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {isGenerating ? "Generating..." : hasRecentError ? "Service Unavailable" : "Generate with AI"}
      </Button>
      <Badge variant="secondary" className="text-xs">
        Pro
      </Badge>
    </div>
  );

  // If deck doesn't have description, show prompt regardless of plan
  if (!hasDescription) {
    return <MissingDescriptionPrompt />;
  }

  return (
    <Protect
      feature="ai_flashcard_generation"
      fallback={<FreeUserPrompt />}
    >
      <ProUserButton />
    </Protect>
  );
}