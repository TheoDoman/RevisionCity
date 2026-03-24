import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Tutor — IGCSE Revision Help',
  description:
    'Get instant help with any IGCSE topic from your personal AI Tutor. Uses Socratic questioning to guide you to the answer rather than just giving it — so the knowledge actually sticks.',
  alternates: { canonical: '/ai-tutor' },
  openGraph: {
    title: 'AI Tutor — RevisionCity',
    description:
      'Your personal AI Tutor for IGCSE revision. Ask any question, get guided explanations — available 24/7 for every subject.',
    url: '/ai-tutor',
  },
};

export default function AiTutorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
