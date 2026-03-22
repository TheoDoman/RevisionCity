'use client';
import { useRouter } from 'next/navigation';

interface ExamBoardToggleProps {
  current: string;
}

export function ExamBoardToggle({ current }: ExamBoardToggleProps) {
  const router = useRouter();

  const select = (board: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('examBoard', board);
    }
    router.push(board === 'cambridge' ? '/subjects' : `/subjects?board=${board}`);
  };

  return (
    <div className="inline-flex items-center bg-brand-100 rounded-xl p-1 gap-1">
      <button
        onClick={() => select('cambridge')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
          current === 'cambridge'
            ? 'bg-[#003865] text-white shadow-sm'
            : 'text-brand-600 hover:text-brand-800'
        }`}
      >
        Cambridge
      </button>
      <button
        onClick={() => select('edexcel')}
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
          current === 'edexcel'
            ? 'bg-[#6A0DAD] text-white shadow-sm'
            : 'text-brand-600 hover:text-brand-800'
        }`}
      >
        Edexcel
      </button>
    </div>
  );
}
