import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About RevisionCity',
  description: 'Learn about RevisionCity — the free IGCSE revision platform built to help students ace their Cambridge and Edexcel exams with notes, flashcards, quizzes, and AI-powered tools.',
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
