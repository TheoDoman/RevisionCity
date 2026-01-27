'use client';

import { useState, useCallback } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Check, X, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Flashcard } from '@/types';

interface FlashcardsProps {
  flashcards: Flashcard[];
  onComplete?: (results: { correct: number; incorrect: number }) => void;
}

export function Flashcards({ flashcards, onComplete }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [shuffledCards, setShuffledCards] = useState(flashcards);
  const [showResults, setShowResults] = useState(false);

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Show results
      setShowResults(true);
      const correct = Object.values(results).filter(r => r === 'correct').length;
      const incorrect = Object.values(results).filter(r => r === 'incorrect').length;
      onComplete?.({ correct, incorrect });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMark = (result: 'correct' | 'incorrect') => {
    setResults({ ...results, [currentCard.id]: result });
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults({});
    setShowResults(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults({});
    setShowResults(false);
  };

  if (showResults) {
    const correct = Object.values(results).filter(r => r === 'correct').length;
    const incorrect = Object.values(results).filter(r => r === 'incorrect').length;
    const unmarked = shuffledCards.length - correct - incorrect;
    const percentage = Math.round((correct / shuffledCards.length) * 100);

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8">
          <div className={cn(
            "text-6xl font-bold mb-2",
            percentage >= 70 ? "text-success-500" : percentage >= 50 ? "text-amber-500" : "text-red-500"
          )}>
            {percentage}%
          </div>
          <p className="text-brand-600">Cards Mastered</p>
        </div>

        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-500">{correct}</div>
            <p className="text-sm text-brand-500">Correct</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{incorrect}</div>
            <p className="text-sm text-brand-500">Incorrect</p>
          </div>
          {unmarked > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-400">{unmarked}</div>
              <p className="text-sm text-brand-500">Skipped</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={handleRestart} className="btn-secondary px-6 py-3">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          <button onClick={handleShuffle} className="btn-primary px-6 py-3">
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle & Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm text-brand-500 mb-2">
          <span>Card {currentIndex + 1} of {shuffledCards.length}</span>
          <button 
            onClick={handleShuffle}
            className="flex items-center gap-1 hover:text-brand-700 transition-colors"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle
          </button>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Flashcard */}
      <div 
        className="w-full max-w-md aspect-[3/2] cursor-pointer perspective-1000 mb-6"
        onClick={handleFlip}
      >
        <div className={cn(
          "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}>
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center text-center backface-hidden bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-xl">
            <p className="text-xl font-medium leading-relaxed">
              {currentCard.front}
            </p>
            <p className="text-brand-200 text-sm mt-4">
              Click to reveal answer
            </p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 bg-white border-2 border-brand-100 text-brand-900 shadow-xl">
            <p className="text-xl font-medium leading-relaxed">
              {currentCard.back}
            </p>
            <div className={cn(
              "mt-4 px-3 py-1 rounded-full text-xs font-medium",
              currentCard.difficulty === 'easy' && "bg-success-100 text-success-700",
              currentCard.difficulty === 'medium' && "bg-amber-100 text-amber-700",
              currentCard.difficulty === 'hard' && "bg-red-100 text-red-700"
            )}>
              {currentCard.difficulty}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-xl border-2 border-brand-100 text-brand-600 hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {isFlipped && (
          <>
            <button
              onClick={() => handleMark('incorrect')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 transition-all"
            >
              <X className="h-5 w-5" />
              Incorrect
            </button>
            <button
              onClick={() => handleMark('correct')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-success-50 border-2 border-success-200 text-success-600 hover:bg-success-100 transition-all"
            >
              <Check className="h-5 w-5" />
              Correct
            </button>
          </>
        )}

        <button
          onClick={handleNext}
          disabled={currentIndex === shuffledCards.length - 1 && !isFlipped}
          className="p-3 rounded-xl border-2 border-brand-100 text-brand-600 hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
