'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

const boards = [
  { value: 'cambridge', label: 'Cambridge IGCSE' },
  { value: 'edexcel', label: 'Edexcel IGCSE' },
];

interface ExamBoardToggleProps {
  currentBoard: string;
}

export default function ExamBoardToggle({ currentBoard }: ExamBoardToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(board: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (board === 'cambridge') {
      params.delete('board');
    } else {
      params.set('board', board);
    }
    router.push(`/subjects${params.size > 0 ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex items-center gap-1 p-1 bg-brand-100 rounded-xl">
        {boards.map((board) => {
          const isActive = currentBoard === board.value;
          return (
            <button
              key={board.value}
              onClick={() => handleSelect(board.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-brand-900 shadow-sm'
                  : 'text-brand-600 hover:text-brand-800 hover:bg-white/50'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              {board.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
