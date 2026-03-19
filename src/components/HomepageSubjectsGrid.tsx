'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const subjects = [
  { name: 'Physics', slug: 'physics', icon: '⚛️', color: 'from-cyan-500 to-blue-600' },
  { name: 'Chemistry', slug: 'chemistry', icon: '⚗️', color: 'from-purple-500 to-violet-600' },
  { name: 'Biology', slug: 'biology', icon: '🧬', color: 'from-green-500 to-emerald-600' },
  { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: 'from-blue-500 to-indigo-600' },
  { name: 'Computer Science', slug: 'computer-science', icon: '💻', color: 'from-indigo-500 to-purple-600' },
  { name: 'Business Studies', slug: 'business-studies', icon: '💼', color: 'from-slate-500 to-gray-600' },
  { name: 'Economics', slug: 'economics', icon: '📈', color: 'from-teal-500 to-cyan-600' },
  { name: 'Geography', slug: 'geography', icon: '🌍', color: 'from-lime-500 to-green-600' },
  { name: 'History', slug: 'history', icon: '🏛️', color: 'from-yellow-500 to-amber-600' },
];

export function HomepageSubjectsGrid() {
  const [board, setBoard] = useState<'cambridge' | 'edexcel'>('cambridge');

  useEffect(() => {
    const saved = localStorage.getItem('examBoard') as 'cambridge' | 'edexcel' | null;
    if (saved === 'cambridge' || saved === 'edexcel') {
      setBoard(saved);
    }

    const handleBoardChange = (e: Event) => {
      const b = (e as CustomEvent<'cambridge' | 'edexcel'>).detail;
      if (b === 'cambridge' || b === 'edexcel') setBoard(b);
    };
    window.addEventListener('examBoardChange', handleBoardChange);
    return () => window.removeEventListener('examBoardChange', handleBoardChange);
  }, []);

  const getHref = (slug: string) =>
    board === 'edexcel' ? `/subject/${slug}-edexcel` : `/subject/${slug}`;

  const viewAllHref = board === 'edexcel' ? '/subjects?board=edexcel' : '/subjects';

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {subjects.map((subject, index) => (
          <Link
            key={subject.name}
            href={getHref(subject.slug)}
            className="group relative p-6 bg-white rounded-2xl border-2 border-brand-100
                     hover:border-transparent hover:shadow-xl transition-all duration-300
                     hover-lift hover-glow animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0
                          group-hover:opacity-15 rounded-2xl transition-opacity duration-300`} />
            <div className="relative text-center">
              <span
                className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300 animate-float"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {subject.icon}
              </span>
              <span className="font-medium text-brand-800 group-hover:text-brand-950 transition-colors">
                {subject.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href={viewAllHref}
          className="inline-flex items-center text-brand-600 hover:text-brand-800 font-medium transition-colors group"
        >
          View all 9 subjects
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </>
  );
}
