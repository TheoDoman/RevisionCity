'use client';

import { useState } from 'react';
import { 
  Lightbulb, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecallPrompt } from '@/types';

interface ActiveRecallProps {
  prompts: RecallPrompt[];
  onComplete?: (completed: number) => void;
}

export function ActiveRecall({ prompts, onComplete }: ActiveRecallProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [completedPrompts, setCompletedPrompts] = useState<Set<number>>(new Set());

  const currentPrompt = prompts[currentIndex];
  const progress = ((currentIndex + 1) / prompts.length) * 100;

  const handleRevealHint = (idx: number) => {
    if (!revealedHints.includes(idx)) {
      setRevealedHints([...revealedHints, idx]);
    }
  };

  const handleNext = () => {
    if (currentIndex < prompts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserResponse('');
      setShowHints(false);
      setRevealedHints([]);
      setShowModelAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserResponse('');
      setShowHints(false);
      setRevealedHints([]);
      setShowModelAnswer(false);
    }
  };

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedPrompts);
    newCompleted.add(currentIndex);
    setCompletedPrompts(newCompleted);
    onComplete?.(newCompleted.size);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-brand-500 mb-2">
          <span>Prompt {currentIndex + 1} of {prompts.length}</span>
          <span>{completedPrompts.size} completed</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Prompt Card */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 overflow-hidden mb-6">
        {/* Prompt Header */}
        <div className="p-6 bg-gradient-to-br from-brand-500 to-brand-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/80 text-sm font-medium">Active Recall</span>
          </div>
          <p className="text-xl text-white leading-relaxed">
            {currentPrompt.prompt}
          </p>
        </div>

        {/* Response Area */}
        <div className="p-6">
          <label className="block text-sm font-medium text-brand-700 mb-2">
            Your Response:
          </label>
          <textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="Explain in your own words..."
            className="w-full h-48 p-4 rounded-xl border-2 border-brand-100 bg-white 
                     focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 
                     outline-none resize-none text-brand-800 placeholder:text-brand-400"
          />
        </div>

        {/* Hints Section */}
        <div className="border-t border-brand-100">
          <button
            onClick={() => setShowHints(!showHints)}
            className="w-full p-4 flex items-center justify-between hover:bg-brand-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand-500" />
              <span className="font-medium text-brand-700">
                Need help? ({currentPrompt.hints.length} hints available)
              </span>
            </div>
            {showHints ? (
              <ChevronUp className="h-5 w-5 text-brand-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-brand-400" />
            )}
          </button>

          {showHints && (
            <div className="px-6 pb-6 space-y-2">
              {currentPrompt.hints.map((hint, idx) => (
                <div key={idx}>
                  {revealedHints.includes(idx) ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-brand-700">{hint}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRevealHint(idx)}
                      className="w-full p-3 bg-brand-50 border border-brand-100 rounded-lg 
                               text-brand-600 hover:bg-brand-100 transition-colors text-left"
                    >
                      Hint {idx + 1} - Click to reveal
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key Points to Include */}
        <div className="border-t border-brand-100 p-6">
          <h4 className="font-medium text-brand-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-500" />
            Key points your answer should include:
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentPrompt.key_points_to_include.map((point, idx) => (
              <span 
                key={idx}
                className="px-3 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Model Answer */}
        <div className="border-t border-brand-100">
          <button
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            className="w-full p-4 flex items-center justify-between hover:bg-brand-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {showModelAnswer ? (
                <EyeOff className="h-5 w-5 text-brand-500" />
              ) : (
                <Eye className="h-5 w-5 text-brand-500" />
              )}
              <span className="font-medium text-brand-700">Model Answer</span>
            </div>
            {showModelAnswer ? (
              <ChevronUp className="h-5 w-5 text-brand-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-brand-400" />
            )}
          </button>

          {showModelAnswer && (
            <div className="px-6 pb-6">
              <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
                <p className="text-brand-700 leading-relaxed whitespace-pre-wrap">
                  {currentPrompt.model_answer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
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
          disabled={completedPrompts.has(currentIndex)}
          className={cn(
            "px-6 py-2 rounded-xl font-medium transition-all",
            completedPrompts.has(currentIndex)
              ? "bg-success-100 text-success-700 cursor-default"
              : "btn-primary"
          )}
        >
          {completedPrompts.has(currentIndex) ? (
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
          disabled={currentIndex === prompts.length - 1}
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
