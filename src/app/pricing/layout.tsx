import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Free, Pro & Premium Plans',
  description: 'RevisionCity is free to start. Upgrade to Pro (£4.99/month) for AI practice tests and analytics, or Premium (£14.99/month) for the AI Tutor, unlimited mock exams, and personalised revision plans.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — RevisionCity',
    description: 'Free IGCSE revision tools. Upgrade to Pro or Premium for AI-powered mock exams, an AI Tutor, and personalised revision plans.',
    url: '/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
