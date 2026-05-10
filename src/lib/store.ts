import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RevisionProgress } from '@/types';

interface AppState {
  // Progress tracking
  progress: Record<string, RevisionProgress>;
  updateProgress: (subtopicId: string, update: Partial<RevisionProgress>) => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Progress tracking
      progress: {},

      updateProgress: (subtopicId, update) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [subtopicId]: {
              subtopic_id: subtopicId,
              notes_read: state.progress[subtopicId]?.notes_read ?? false,
              flashcards_reviewed: state.progress[subtopicId]?.flashcards_reviewed ?? 0,
              quiz_best_score: state.progress[subtopicId]?.quiz_best_score ?? 0,
              practice_questions_completed: state.progress[subtopicId]?.practice_questions_completed ?? 0,
              recall_prompts_completed: state.progress[subtopicId]?.recall_prompts_completed ?? 0,
              ...update,
            },
          },
        }));
      },

      // UI state
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'revision-city-storage',
      partialize: (state) => ({
        progress: state.progress,
      }),
    }
  )
);
