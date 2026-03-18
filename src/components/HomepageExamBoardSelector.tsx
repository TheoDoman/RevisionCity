'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HomepageExamBoardSelector() {
  const [board, setBoard] = useState<'cambridge' | 'edexcel'>('cambridge');

  useEffect(() => {
    const saved = localStorage.getItem('examBoard') as 'cambridge' | 'edexcel' | null;
    if (saved === 'cambridge' || saved === 'edexcel') {
      setBoard(saved);
    }
  }, []);

  const select = (b: 'cambridge' | 'edexcel') => {
    setBoard(b);
    localStorage.setItem('examBoard', b);
  };

  const subjectsHref = board === 'cambridge' ? '/subjects' : '/subjects?board=edexcel';

  return (
    <div className="mt-8 flex flex-col items-center gap-4 animate-slide-up animation-delay-150">
      <p className="text-sm font-medium text-brand-600">Select your exam board:</p>
      <div className="inline-flex items-center bg-white rounded-xl p-1 gap-1 shadow-md border border-brand-100">
        <button
          onClick={() => select('cambridge')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            board === 'cambridge'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-brand-600 hover:text-brand-800 hover:bg-brand-50'
          }`}
        >
          Cambridge
        </button>
        <button
          onClick={() => select('edexcel')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            board === 'edexcel'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-brand-600 hover:text-brand-800 hover:bg-brand-50'
          }`}
        >
          Edexcel
        </button>
      </div>
      <Link
        href={subjectsHref}
        className="btn-primary px-8 py-4 text-lg hover-lift hover-glow animate-glow"
      >
        Start Revising Free
        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
