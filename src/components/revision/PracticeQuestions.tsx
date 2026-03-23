'use client';

import { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Award,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PracticeQuestion } from '@/types';

interface PracticeQuestionsProps {
  questions: PracticeQuestion[];
  onComplete?: (completed: number) => void;
}

/** Normalise a string for comparison: lowercase, collapse whitespace */
function normalise(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Case-insensitive exact match; also handles numeric equivalence (42 === 42.0) */
function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const u = normalise(userAnswer);
  const c = normalise(correctAnswer);
  if (u === c) return true;
  const uNum = parseFloat(u);
  const cNum = parseFloat(c);
  if (!isNaN(uNum) && !isNaN(cNum) && isFinite(uNum) && isFinite(cNum)) {
    return uNum === cNum;
  }
  return false;
}

/** Fire-and-forget save to Supabase */
function saveResult(questionId: string, userAnswer: string, isCorrect: boolean) {
  fetch('/api/practice-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: questionId, user_answer: userAnswer, is_correct: isCorrect }),
  }).catch(() => {});
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'foundation': return 'bg-success-100 text-success-700';
    case 'higher':     return 'bg-amber-100 text-amber-700';
    case 'extended':   return 'bg-red-100 text-red-700';
    default:           return 'bg-brand-100 text-brand-700';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Short question — exact match UX
// ─────────────────────────────────────────────────────────────────────────────
interface ShortQuestionProps {
  question: PracticeQuestion;
  onNext: (wasCorrect: boolean) => void;
  onSkip: () => void;
  isLast: boolean;
}

function ShortQuestion({ question, onNext, onSkip, isLast }: ShortQuestionProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = () => {
    if (!userAnswer.trim() || !question.correct_answer) return;
    const correct = checkAnswer(userAnswer, question.correct_answer);
    setResult(correct ? 'correct' : 'incorrect');
    saveResult(question.id, userAnswer, correct);
  };

  const handleNext = () => {
    onNext(result === 'correct');
  };

  return (
    <div className="p-6 bg-brand-50/50">
      {result === null ? (
        <>
          <label className="block text-sm font-medium text-brand-700 mb-2">Your Answer:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && handleSubmit()}
              placeholder="Type your answer and press Enter…"
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-brand-100 bg-white
                         focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                         outline-none text-brand-800 placeholder:text-brand-400"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium
                         hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Check
            </button>
          </div>
          <button
            onClick={onSkip}
            className="mt-3 flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-600 transition-colors"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Skip
          </button>
        </>
      ) : result === 'correct' ? (
        <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Correct!</span>
          </div>
          <p className="text-sm text-green-700">
            Your answer: <span className="font-medium">&ldquo;{userAnswer}&rdquo;</span>
          </p>
          <button
            onClick={handleNext}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white
                       rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {isLast ? 'Finish' : 'Next Question'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">Incorrect</span>
          </div>
          <p className="text-sm text-red-700 mb-2">
            Your answer: <span className="font-medium">&ldquo;{userAnswer}&rdquo;</span>
          </p>
          <div className="bg-white rounded-lg px-3 py-2 border border-red-200">
            <p className="text-xs text-red-500 font-medium mb-0.5">Correct answer:</p>
            <p className="text-sm text-red-800 font-semibold">{question.correct_answer}</p>
          </div>
          <button
            onClick={handleNext}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 text-white
                       rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
          >
            {isLast ? 'Finish' : 'Next Question'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Extended question — self-assessment UX (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
interface ExtendedQuestionProps {
  question: PracticeQuestion;
  onMarkComplete: () => void;
  isCompleted: boolean;
}

function ExtendedQuestion({ question, onMarkComplete, isCompleted }: ExtendedQuestionProps) {
  const [showMarkScheme, setShowMarkScheme]     = useState(false);
  const [showExampleAnswer, setShowExampleAnswer] = useState(false);
  const [userAnswer, setUserAnswer]               = useState('');

  return (
    <>
      {/* Answer Area */}
      <div className="p-6 bg-brand-50/50">
        <label className="block text-sm font-medium text-brand-700 mb-2">Your Answer:</label>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Write your answer here…"
          className="w-full h-40 p-4 rounded-xl border-2 border-brand-100 bg-white
                     focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                     outline-none resize-none text-brand-800 placeholder:text-brand-400"
        />
      </div>

      {/* Mark Scheme */}
      <div className="border-t border-brand-100">
        <button
          onClick={() => setShowMarkScheme(!showMarkScheme)}
          className="w-full p-4 flex items-center justify-between hover:bg-brand-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {showMarkScheme ? <EyeOff className="h-5 w-5 text-brand-500" /> : <Eye className="h-5 w-5 text-brand-500" />}
            <span className="font-medium text-brand-700">Mark Scheme</span>
          </div>
          {showMarkScheme ? <ChevronUp className="h-5 w-5 text-brand-400" /> : <ChevronDown className="h-5 w-5 text-brand-400" />}
        </button>

        {showMarkScheme && (
          <div className="px-6 pb-6">
            <ul className="space-y-2">
              {question.mark_scheme.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-brand-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success-500 shrink-0 mt-0.5" />
                  <span className="text-brand-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Example Answer */}
      <div className="border-t border-brand-100">
        <button
          onClick={() => setShowExampleAnswer(!showExampleAnswer)}
          className="w-full p-4 flex items-center justify-between hover:bg-brand-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {showExampleAnswer ? <EyeOff className="h-5 w-5 text-brand-500" /> : <Eye className="h-5 w-5 text-brand-500" />}
            <span className="font-medium text-brand-700">Example Answer</span>
          </div>
          {showExampleAnswer ? <ChevronUp className="h-5 w-5 text-brand-400" /> : <ChevronDown className="h-5 w-5 text-brand-400" />}
        </button>

        {showExampleAnswer && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
              <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">{question.example_answer}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mark complete */}
      <div className="border-t border-brand-100 px-6 py-4">
        <button
          onClick={onMarkComplete}
          disabled={isCompleted}
          className={cn(
            'px-6 py-2 rounded-xl font-medium transition-all',
            isCompleted ? 'bg-success-100 text-success-700 cursor-default' : 'btn-secondary',
          )}
        >
          {isCompleted ? (
            <><CheckCircle2 className="h-4 w-4 inline mr-2" />Completed</>
          ) : (
            'Mark Complete'
          )}
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function PracticeQuestions({ questions, onComplete }: PracticeQuestionsProps) {
  const [currentIndex, setCurrentIndex]           = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

  const currentQuestion = questions[currentIndex];
  const progress        = ((currentIndex + 1) / questions.length) * 100;
  const isShort         = currentQuestion.question_type === 'short' && !!currentQuestion.correct_answer;

  const markComplete = (index: number) => {
    const next = new Set(completedQuestions);
    next.add(index);
    setCompletedQuestions(next);
    onComplete?.(next.size);
  };

  const advance = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleShortNext = (wasCorrect: boolean) => {
    void wasCorrect; // progress is tracked by parent via onComplete for short questions too
    markComplete(currentIndex);
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSkip = () => {
    advance();
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-brand-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{completedQuestions.size} completed</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-brand-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-xl">
                <FileText className="h-5 w-5 text-brand-600" />
              </div>
              <span className={cn('inline-block px-3 py-1 rounded-full text-xs font-medium', getDifficultyColor(currentQuestion.difficulty))}>
                {currentQuestion.difficulty}
              </span>
              {isShort && (
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Short answer
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-400" />
              <span className="font-medium text-brand-700">{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <p className="text-lg text-brand-900 leading-relaxed">{currentQuestion.question}</p>
        </div>

        {/* Body — branches on question type */}
        {isShort ? (
          <ShortQuestion
            question={currentQuestion}
            onNext={handleShortNext}
            onSkip={handleSkip}
            isLast={currentIndex === questions.length - 1}
          />
        ) : (
          <ExtendedQuestion
            question={currentQuestion}
            onMarkComplete={() => markComplete(currentIndex)}
            isCompleted={completedQuestions.has(currentIndex)}
          />
        )}
      </div>

      {/* Navigation (extended questions only — short questions navigate via their own buttons) */}
      {!isShort && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-50
                       rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            onClick={advance}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-50
                       rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
