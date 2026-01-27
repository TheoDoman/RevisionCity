'use client';

import { useState } from 'react';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PracticeQuestion } from '@/types';

interface PracticeQuestionsProps {
  questions: PracticeQuestion[];
  onComplete?: (completed: number) => void;
}

export function PracticeQuestions({ questions, onComplete }: PracticeQuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  const [showExampleAnswer, setShowExampleAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMarkScheme(false);
      setShowExampleAnswer(false);
      setUserAnswer('');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowMarkScheme(false);
      setShowExampleAnswer(false);
      setUserAnswer('');
    }
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedQuestions);
    newCompleted.add(currentIndex);
    setCompletedQuestions(newCompleted);
    onComplete?.(newCompleted.size);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'foundation':
        return 'bg-success-100 text-success-700';
      case 'higher':
        return 'bg-amber-100 text-amber-700';
      case 'extended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-brand-100 text-brand-700';
    }
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
        {/* Question Header */}
        <div className="p-6 border-b border-brand-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-xl">
                <FileText className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <span className={cn(
                  "inline-block px-3 py-1 rounded-full text-xs font-medium",
                  getDifficultyColor(currentQuestion.difficulty)
                )}>
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-400" />
              <span className="font-medium text-brand-700">{currentQuestion.marks} marks</span>
            </div>
          </div>

          <p className="text-lg text-brand-900 leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* Answer Area */}
        <div className="p-6 bg-brand-50/50">
          <label className="block text-sm font-medium text-brand-700 mb-2">
            Your Answer:
          </label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your answer here..."
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
              {showMarkScheme ? (
                <EyeOff className="h-5 w-5 text-brand-500" />
              ) : (
                <Eye className="h-5 w-5 text-brand-500" />
              )}
              <span className="font-medium text-brand-700">Mark Scheme</span>
            </div>
            {showMarkScheme ? (
              <ChevronUp className="h-5 w-5 text-brand-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-brand-400" />
            )}
          </button>

          {showMarkScheme && (
            <div className="px-6 pb-6">
              <ul className="space-y-2">
                {currentQuestion.mark_scheme.map((point, idx) => (
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
              {showExampleAnswer ? (
                <EyeOff className="h-5 w-5 text-brand-500" />
              ) : (
                <Eye className="h-5 w-5 text-brand-500" />
              )}
              <span className="font-medium text-brand-700">Example Answer</span>
            </div>
            {showExampleAnswer ? (
              <ChevronUp className="h-5 w-5 text-brand-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-brand-400" />
            )}
          </button>

          {showExampleAnswer && (
            <div className="px-6 pb-6">
              <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
                <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.example_answer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
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
          onClick={handleMarkComplete}
          disabled={completedQuestions.has(currentIndex)}
          className={cn(
            "px-6 py-2 rounded-xl font-medium transition-all",
            completedQuestions.has(currentIndex)
              ? "bg-success-100 text-success-700 cursor-default"
              : "btn-secondary"
          )}
        >
          {completedQuestions.has(currentIndex) ? (
            <>
              <CheckCircle2 className="h-4 w-4 inline mr-2" />
              Completed
            </>
          ) : (
            'Mark Complete'
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-50 
                   rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
