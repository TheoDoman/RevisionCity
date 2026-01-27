'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<Record<number, { selected: string; correct: boolean }>>({});

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  const handleSelect = (answer: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || hasAnswered) return;
    
    setHasAnswered(true);
    const correct = selectedAnswer === currentQuestion.correct_answer;
    
    if (correct) {
      setScore(score + 1);
    }
    
    setAnswers({
      ...answers,
      [currentIndex]: { selected: selectedAnswer, correct }
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      setShowResults(true);
      onComplete?.(score + (isCorrect ? 1 : 0), questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setScore(0);
    setShowResults(false);
    setAnswers({});
  };

  const getOptionClass = (option: string) => {
    if (!hasAnswered) {
      return cn(
        "quiz-option",
        selectedAnswer === option && "selected"
      );
    }
    
    if (option === currentQuestion.correct_answer) {
      return "quiz-option correct";
    }
    
    if (option === selectedAnswer && option !== currentQuestion.correct_answer) {
      return "quiz-option incorrect";
    }
    
    return "quiz-option opacity-50";
  };

  if (showResults) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-6">
          <Trophy className={cn(
            "h-16 w-16 mx-auto mb-4",
            percentage >= 70 ? "text-yellow-500" : "text-brand-300"
          )} />
        </div>
        
        <div className="text-center mb-8">
          <div className={cn(
            "text-6xl font-bold mb-2",
            percentage >= 70 ? "text-success-500" : percentage >= 50 ? "text-amber-500" : "text-red-500"
          )}>
            {percentage}%
          </div>
          <p className="text-brand-600">
            You got {finalScore} out of {questions.length} correct
          </p>
        </div>

        {/* Question Review */}
        <div className="w-full max-w-lg mb-8">
          <h3 className="font-medium text-brand-800 mb-4">Review:</h3>
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div 
                key={idx}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  answers[idx]?.correct ? "bg-success-50" : "bg-red-50"
                )}
              >
                {answers[idx]?.correct ? (
                  <CheckCircle2 className="h-5 w-5 text-success-500 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
                <span className="text-sm text-brand-700 truncate">
                  Q{idx + 1}: {q.question.substring(0, 50)}...
                </span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleRestart} className="btn-primary px-8 py-3">
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-brand-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Score: {score}/{currentIndex + (hasAnswered ? 1 : 0)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className={cn(
          "inline-block px-3 py-1 rounded-full text-xs font-medium mb-3",
          currentQuestion.difficulty === 'easy' && "bg-success-100 text-success-700",
          currentQuestion.difficulty === 'medium' && "bg-amber-100 text-amber-700",
          currentQuestion.difficulty === 'hard' && "bg-red-100 text-red-700"
        )}>
          {currentQuestion.difficulty}
        </div>
        <h3 className="text-xl font-medium text-brand-900">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options?.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            disabled={hasAnswered}
            className={getOptionClass(option)}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium",
                selectedAnswer === option && !hasAnswered && "bg-brand-500 text-white",
                hasAnswered && option === currentQuestion.correct_answer && "bg-success-500 text-white",
                hasAnswered && option === selectedAnswer && option !== currentQuestion.correct_answer && "bg-red-500 text-white",
                !selectedAnswer || (selectedAnswer !== option && !hasAnswered) ? "bg-brand-100 text-brand-600" : ""
              )}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-left">{option}</span>
            </div>
            {hasAnswered && option === currentQuestion.correct_answer && (
              <CheckCircle2 className="h-5 w-5 text-success-500 shrink-0" />
            )}
            {hasAnswered && option === selectedAnswer && option !== currentQuestion.correct_answer && (
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Explanation (shown after answering) */}
      {hasAnswered && currentQuestion.explanation && (
        <div className={cn(
          "p-4 rounded-xl mb-6",
          isCorrect ? "bg-success-50 border border-success-200" : "bg-red-50 border border-red-200"
        )}>
          <p className={cn(
            "font-medium mb-1",
            isCorrect ? "text-success-700" : "text-red-700"
          )}>
            {isCorrect ? "Correct!" : "Incorrect"}
          </p>
          <p className="text-sm text-brand-600">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!hasAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary px-6 py-3">
            {currentIndex < questions.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              'See Results'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
