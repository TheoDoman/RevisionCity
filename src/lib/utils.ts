import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function getSubjectIcon(subjectSlug: string): string {
  const icons: Record<string, string> = {
    mathematics: '📐',
    english: '📚',
    biology: '🧬',
    chemistry: '⚗️',
    physics: '⚛️',
    french: '🇫🇷',
    spanish: '🇪🇸',
    business: '💼',
    economics: '📈',
    history: '🏛️',
    geography: '🌍',
  };
  return icons[subjectSlug] || '📖';
}

export function getSubjectColor(subjectSlug: string): string {
  const colors: Record<string, string> = {
    mathematics: 'from-blue-500 to-indigo-600',
    english: 'from-amber-500 to-orange-600',
    biology: 'from-green-500 to-emerald-600',
    chemistry: 'from-purple-500 to-violet-600',
    physics: 'from-cyan-500 to-blue-600',
    french: 'from-rose-500 to-pink-600',
    spanish: 'from-red-500 to-orange-600',
    business: 'from-slate-500 to-gray-600',
    economics: 'from-teal-500 to-cyan-600',
    history: 'from-yellow-500 to-amber-600',
    geography: 'from-lime-500 to-green-600',
  };
  return colors[subjectSlug] || 'from-gray-500 to-slate-600';
}

// Free tier limits
export const FREE_TIER_LIMITS = {
  subtopicsPerSubject: 2,
  quizzesPerDay: 5,
  flashcardsPerDay: 20,
  trialDays: 1,
};

export const SUBSCRIPTION_PRICES = {
  pro: {
    monthly: 4.99,  // Highly competitive - cheaper than Quizlet Plus
    yearly: 39.99,  // 33% discount (~€3.33/month)
  },
  premium: {
    monthly: 7.99, // Premium tier with AI tutor
    yearly: 63.99, // 33% discount (~€5.33/month)
  },
};
