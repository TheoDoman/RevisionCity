import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SubscriptionTier, UsageTracker, RevisionProgress } from '@/types';
import { FREE_TIER_LIMITS } from './utils';

interface AppState {
  // Subscription
  subscriptionTier: SubscriptionTier;
  trialStarted: string | null;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  startTrial: () => void;
  isTrialExpired: () => boolean;

  // Usage tracking (for free tier)
  usage: UsageTracker;
  trackSubtopicAccess: (subtopicId: string) => boolean;
  trackQuizTaken: () => boolean;
  trackFlashcardsReviewed: (count: number) => boolean;
  resetDailyUsage: () => void;

  // Progress tracking
  progress: Record<string, RevisionProgress>;
  updateProgress: (subtopicId: string, update: Partial<RevisionProgress>) => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const initialUsage: UsageTracker = {
  subtopics_accessed: [],
  quizzes_taken_today: 0,
  flashcards_reviewed_today: 0,
  last_reset: new Date().toDateString(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Subscription
      subscriptionTier: 'free',
      trialStarted: null,

      setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),

      startTrial: () => {
        const now = new Date().toISOString();
        set({ trialStarted: now });
      },

      isTrialExpired: () => {
        const { trialStarted, subscriptionTier } = get();
        if (subscriptionTier !== 'free') return false;
        if (!trialStarted) return false;

        const trialEnd = new Date(trialStarted);
        trialEnd.setDate(trialEnd.getDate() + FREE_TIER_LIMITS.trialDays);
        return new Date() > trialEnd;
      },

      // Usage tracking
      usage: initialUsage,

      trackSubtopicAccess: (subtopicId: string) => {
        const { subscriptionTier, usage } = get();
        if (subscriptionTier !== 'free') return true;

        // Check if already accessed
        if (usage.subtopics_accessed.includes(subtopicId)) return true;

        // Check limit
        if (usage.subtopics_accessed.length >= FREE_TIER_LIMITS.subtopicsPerSubject) {
          return false;
        }

        set({
          usage: {
            ...usage,
            subtopics_accessed: [...usage.subtopics_accessed, subtopicId],
          },
        });
        return true;
      },

      trackQuizTaken: () => {
        const { subscriptionTier, usage } = get();
        if (subscriptionTier !== 'free') return true;

        if (usage.quizzes_taken_today >= FREE_TIER_LIMITS.quizzesPerDay) {
          return false;
        }

        set({
          usage: {
            ...usage,
            quizzes_taken_today: usage.quizzes_taken_today + 1,
          },
        });
        return true;
      },

      trackFlashcardsReviewed: (count: number) => {
        const { subscriptionTier, usage } = get();
        if (subscriptionTier !== 'free') return true;

        const newTotal = usage.flashcards_reviewed_today + count;
        if (newTotal > FREE_TIER_LIMITS.flashcardsPerDay) {
          return false;
        }

        set({
          usage: {
            ...usage,
            flashcards_reviewed_today: newTotal,
          },
        });
        return true;
      },

      resetDailyUsage: () => {
        const today = new Date().toDateString();
        const { usage } = get();

        if (usage.last_reset !== today) {
          set({
            usage: {
              ...usage,
              quizzes_taken_today: 0,
              flashcards_reviewed_today: 0,
              last_reset: today,
            },
          });
        }
      },

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
        subscriptionTier: state.subscriptionTier,
        trialStarted: state.trialStarted,
        usage: state.usage,
        progress: state.progress,
      }),
    }
  )
);
