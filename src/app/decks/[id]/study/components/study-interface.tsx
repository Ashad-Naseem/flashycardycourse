"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  ArrowRight,
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  BookOpen,
  Shuffle,
  Eye,
  Keyboard,
  Settings
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Card {
  id: number;
  front: string;
  back: string;
  createdAt: Date;
}

interface StudyInterfaceProps {
  deckId: number;
  deckName: string;
  cards: Card[];
}

interface StudyResult {
  cardId: number;
  correct: boolean;
}

type StudyMode = "sequential" | "random" | "review";

export function StudyInterface({ deckId, deckName, cards }: StudyInterfaceProps) {
  const router = useRouter();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [studyCards, setStudyCards] = useState<Card[]>([]);
  const [results, setResults] = useState<StudyResult[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("sequential");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const startSession = useCallback((mode: StudyMode = studyMode) => {
    let cardsToStudy: Card[] = [];
    
    switch (mode) {
      case "random":
        cardsToStudy = [...cards].sort(() => Math.random() - 0.5);
        break;
      case "review":
        // For now, just shuffle incorrectly answered cards, or all if no previous results
        const incorrectCardIds = results.filter(r => !r.correct).map(r => r.cardId);
        if (incorrectCardIds.length > 0) {
          cardsToStudy = cards.filter(card => incorrectCardIds.includes(card.id));
        } else {
          cardsToStudy = [...cards];
        }
        break;
      default:
        cardsToStudy = [...cards];
    }
    
    setStudyMode(mode);
    setStudyCards(cardsToStudy);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsFlipping(false); // Reset flip state
    setResults([]);
    setSessionStarted(true);
    setSessionComplete(false);
  }, [cards, studyMode, results]);

  const handleAnswer = useCallback((correct: boolean) => {
    const currentCard = studyCards[currentCardIndex];
    const newResult: StudyResult = {
      cardId: currentCard.id,
      correct: correct
    };

    const newResults = [...results, newResult];
    setResults(newResults);

    if (currentCardIndex + 1 >= studyCards.length) {
      // Session complete
      setSessionComplete(true);
    } else {
      // Move to next card
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setIsFlipping(false); // Reset flip state
    }
  }, [studyCards, currentCardIndex, results]);

  const handlePrevious = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setIsFlipping(false); // Reset flip state
      // Remove the result for the current card if it exists
      const currentCard = studyCards[currentCardIndex];
      setResults(prev => prev.filter(r => r.cardId !== currentCard.id));
    }
  }, [currentCardIndex, studyCards]);

  const handleNext = useCallback(() => {
    if (currentCardIndex + 1 < studyCards.length) {
      // Only allow navigation to next card if current card hasn't been answered yet
      // or if we're just moving forward without answering
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setIsFlipping(false); // Reset flip state
    }
  }, [currentCardIndex, studyCards]);

  const handleFlip = useCallback(() => {
    if (isFlipping) return; // Prevent rapid flipping
    
    setIsFlipping(true);
    // Small delay to allow animation to start
    setTimeout(() => {
      setShowAnswer(!showAnswer);
      // Reset flipping state after animation completes
      setTimeout(() => {
        setIsFlipping(false);
      }, 300); // Match CSS transition duration
    }, 150); // Half of flip animation
  }, [showAnswer, isFlipping]);

  const resetSession = () => {
    setSessionStarted(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsFlipping(false); // Reset flip state
    setResults([]);
    setSessionComplete(false);
    setStudyCards([]);
  };

  const exitStudy = () => {
    router.push(`/decks/${deckId}`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!sessionStarted || sessionComplete) return;
      
      // Prevent shortcuts when typing in inputs or other interactive elements
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case " ": // Space to flip card (show/hide answer)
          event.preventDefault();
          handleFlip();
          break;
        case "enter":
          event.preventDefault();
          if (!showAnswer) {
            setShowAnswer(true);
          }
          break;
        case "1":
        case "x":
          if (showAnswer) {
            event.preventDefault();
            handleAnswer(false);
          }
          break;
        case "2":
        case "c":
          if (showAnswer) {
            event.preventDefault();
            handleAnswer(true);
          }
          break;
        case "arrowleft":
          if (currentCardIndex > 0) {
            event.preventDefault();
            handlePrevious();
          }
          break;
        case "arrowright":
          if (currentCardIndex + 1 < studyCards.length) {
            event.preventDefault();
            handleNext();
          }
          break;
        case "backspace":
          if (!showAnswer && currentCardIndex > 0) {
            event.preventDefault();
            handlePrevious();
          }
          break;
        case "?":
          event.preventDefault();
          setShowKeyboardShortcuts(true);
          break;
        case "escape":
          event.preventDefault();
          exitStudy();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [sessionStarted, sessionComplete, showAnswer, currentCardIndex, handleAnswer, handlePrevious, handleNext, handleFlip]);

  const currentCard = studyCards[currentCardIndex];
  const progress = sessionStarted ? ((currentCardIndex + (showAnswer ? 0.5 : 0)) / studyCards.length) * 100 : 0;
  const correctAnswers = results.filter(r => r.correct).length;
  const totalAnswered = results.length;
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" onClick={exitStudy}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Deck
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{deckName}</h1>
            <p className="text-muted-foreground">Ready to study {cards.length} cards</p>
          </div>

          {/* Study Mode Selection */}
          <div className="space-y-6 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Choose Study Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button 
                    size="lg" 
                    className="justify-start h-auto p-4"
                    onClick={() => startSession("sequential")}
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-semibold">Sequential Study</span>
                      </div>
                      <p className="text-sm opacity-90">Study cards in order, great for learning new material</p>
                    </div>
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="justify-start h-auto p-4"
                    onClick={() => startSession("random")}
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Shuffle className="h-4 w-4" />
                        <span className="font-semibold">Random Study</span>
                      </div>
                      <p className="text-sm opacity-70">Study cards in random order for better retention</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Keyboard className="h-4 w-4" />
              <AlertDescription>
                <strong>Keyboard shortcuts:</strong> Space to flip card • ←/→ to navigate • Click card to flip • 1/X for incorrect • 2/C for correct • ? for help • Esc to exit
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <Trophy className="h-20 w-20 text-yellow-500 mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Session Complete!</h2>
                  <h3 className="text-xl text-muted-foreground">{deckName}</h3>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                      <div className="text-sm text-muted-foreground">Correct</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{totalAnswered - correctAnswers}</div>
                      <div className="text-sm text-muted-foreground">Incorrect</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{accuracy}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>

                <div className="flex justify-center gap-3">
                  <Button onClick={() => startSession("sequential")} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Study Again
                  </Button>
                  {totalAnswered - correctAnswers > 0 && (
                    <Button onClick={() => startSession("review")} variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Review Incorrect
                    </Button>
                  )}
                  <Button onClick={exitStudy}>
                    Back to Deck
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={exitStudy}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div className="text-sm font-medium">
                {deckName}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {correctAnswers}/{totalAnswered} correct
              </Badge>
              <div className="text-sm font-medium">
                {currentCardIndex + 1} / {studyCards.length}
              </div>
              
              <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>Use these shortcuts to study more efficiently</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd></div>
                      <div>Flip card (3D animation)</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Click</kbd></div>
                      <div>Click anywhere on card to flip</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd></div>
                      <div>Show answer (one-way)</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">←</kbd></div>
                      <div>Previous card</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd></div>
                      <div>Next card</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">1</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-xs">X</kbd></div>
                      <div>Mark incorrect</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">2</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-xs">C</kbd></div>
                      <div>Mark correct</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Backspace</kbd></div>
                      <div>Previous card (when question shown)</div>
                      <div><kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd></div>
                      <div>Exit study session</div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="mt-3">
            <Progress value={progress} className="h-1" />
          </div>
        </div>
      </div>

      {/* Main Study Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Flip Card Container */}
          <div 
            className="flip-card-container w-full h-[500px] cursor-pointer" 
            style={{ perspective: '1000px' }}
            onClick={handleFlip}
          >
            <div 
              className={`flip-card w-full h-full relative transition-transform duration-700 ${showAnswer ? 'rotate-y-180' : ''} ${isFlipping ? 'pointer-events-none' : ''}`}
              style={{ 
                transformStyle: 'preserve-3d',
                transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)'
              }}
            >
              
              {/* Front Side - Question */}
              <Card 
                className="absolute inset-0 w-full h-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-2 border-blue-200"
                style={{ 
                  backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  color: 'white'
                }}
              >
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg text-blue-100 font-semibold">
                    Question
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center space-y-6 w-full">
                    <p className="text-2xl leading-relaxed max-w-3xl mx-auto font-medium text-white">
                      {currentCard?.front}
                    </p>
                    <div className="flex justify-center">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlip();
                        }}
                        size="lg"
                        variant="secondary"
                        className="min-w-[160px] bg-white/90 hover:bg-white text-blue-700 border-0 font-medium"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Flip to Answer
                        <kbd className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Space</kbd>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Back Side - Answer */}
              <Card 
                className="absolute inset-0 w-full h-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow border-2 border-green-200"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                  color: 'white'
                }}
              >
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg text-green-100 font-semibold">
                    Answer
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center space-y-6 w-full">
                    <p className="text-2xl leading-relaxed max-w-3xl mx-auto font-medium text-white">
                      {currentCard?.back}
                    </p>
                    <div className="flex justify-center">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFlip();
                        }}
                        variant="secondary"
                        size="lg"
                        className="min-w-[160px] bg-white/90 hover:bg-white text-green-700 border-0 font-medium"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Flip to Question
                        <kbd className="ml-2 px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">Space</kbd>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      {showAnswer && (
        <div className="border-t bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleAnswer(false)}
                variant="outline"
                size="lg"
                className="min-w-[140px] border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Incorrect
                <kbd className="ml-2 px-1 py-0.5 bg-muted rounded text-xs">1</kbd>
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                size="lg"
                className="min-w-[140px] bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Correct
                <kbd className="ml-2 px-1 py-0.5 bg-green-800 rounded text-xs">2</kbd>
              </Button>
            </div>
            
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button
                onClick={handlePrevious}
                variant="ghost"
                size="sm"
                disabled={currentCardIndex === 0}
                className="min-w-[120px]"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
                <kbd className="ml-2 px-1 py-0.5 bg-muted rounded text-xs">←</kbd>
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {currentCardIndex + 1} of {studyCards.length}
              </div>
              
              <Button
                onClick={handleNext}
                variant="ghost"
                size="sm"
                disabled={currentCardIndex + 1 >= studyCards.length}
                className="min-w-[120px]"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
                <kbd className="ml-2 px-1 py-0.5 bg-muted rounded text-xs">→</kbd>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom CSS for flip animation */}
      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}