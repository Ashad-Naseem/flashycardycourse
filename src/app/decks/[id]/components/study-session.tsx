"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  BookOpen,
  Shuffle
} from "lucide-react";

interface Card {
  id: number;
  front: string;
  back: string;
  createdAt: Date;
}

interface StudySessionProps {
  cards: Card[];
  deckName: string;
  randomOrder?: boolean;
}

interface StudyResult {
  cardId: number;
  correct: boolean;
}

export function StudySession({ cards, deckName, randomOrder = false }: StudySessionProps) {
  const [open, setOpen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyCards, setStudyCards] = useState<Card[]>([]);
  const [results, setResults] = useState<StudyResult[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const startSession = useCallback(() => {
    const cardsToStudy = randomOrder 
      ? [...cards].sort(() => Math.random() - 0.5)
      : [...cards];
    
    setStudyCards(cardsToStudy);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setResults([]);
    setSessionStarted(true);
    setSessionComplete(false);
  }, [cards, randomOrder]);

  const handleAnswer = (correct: boolean) => {
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
    }
  };

  const resetSession = () => {
    setSessionStarted(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setResults([]);
    setSessionComplete(false);
    setStudyCards([]);
  };

  const closeDialog = () => {
    setOpen(false);
    resetSession();
  };

  if (cards.length === 0) {
    return null;
  }

  const currentCard = studyCards[currentCardIndex];
  const progress = ((currentCardIndex + (showAnswer ? 0.5 : 0)) / studyCards.length) * 100;
  const correctAnswers = results.filter(r => r.correct).length;
  const totalAnswered = results.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="min-w-[140px]">
          <BookOpen className="h-4 w-4 mr-2" />
          {randomOrder ? (
            <>
              <Shuffle className="h-4 w-4 mr-1" />
              Random Study
            </>
          ) : (
            "Start Study Session"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {deckName} - Study Session
          </DialogTitle>
          <DialogDescription>
            {randomOrder ? "Cards in random order" : "Study all cards in order"}
          </DialogDescription>
        </DialogHeader>

        {!sessionStarted ? (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div className="text-6xl">📚</div>
              <h3 className="text-xl font-semibold">Ready to Study?</h3>
              <p className="text-muted-foreground">
                You have <strong>{cards.length}</strong> cards to study
              </p>
            </div>
            <div className="flex justify-center">
              <Button onClick={startSession} size="lg">
                Begin Study Session
              </Button>
            </div>
          </div>
        ) : sessionComplete ? (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
              <h3 className="text-2xl font-bold">Session Complete!</h3>
              <div className="space-y-2">
                <p className="text-lg">
                  <span className="font-semibold text-green-600">{correctAnswers}</span>
                  {" "}correct out of{" "}
                  <span className="font-semibold">{totalAnswered}</span>
                </p>
                <p className="text-muted-foreground">
                  Accuracy: {totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0}%
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              <Button onClick={startSession} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Button onClick={closeDialog}>
                Finish Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Card {currentCardIndex + 1} of {studyCards.length}
                </span>
                <Badge variant="secondary">
                  {correctAnswers}/{totalAnswered} correct
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Study Card */}
            <Card className="min-h-[200px]">
              <CardHeader>
                <CardTitle className="text-center">
                  {showAnswer ? "Answer" : "Question"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-lg leading-relaxed">
                    {showAnswer ? currentCard?.back : currentCard?.front}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-2">
              {!showAnswer ? (
                <Button 
                  onClick={() => setShowAnswer(true)}
                  size="lg"
                  className="min-w-[120px]"
                >
                  Show Answer
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAnswer(false)}
                    variant="outline"
                    size="lg"
                    className="min-w-[120px] border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    onClick={() => handleAnswer(true)}
                    size="lg"
                    className="min-w-[120px] bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Correct
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}