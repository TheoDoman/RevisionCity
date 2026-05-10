import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description:
    'Answers to common questions about RevisionCity — which subjects are covered, Cambridge vs Edexcel support, the AI Tutor, mock exams, and more. Every feature is free.',
  alternates: { canonical: '/faq' },
  keywords: ['IGCSE revision FAQ', 'RevisionCity help', 'IGCSE study platform'],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is RevisionCity?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RevisionCity is a free IGCSE revision platform with comprehensive study notes, flashcards, quizzes, practice questions, an AI Tutor, mock exam simulator, and personalised revision plans — covering Cambridge and Edexcel subjects.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which subjects are available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer 9 core IGCSE subjects: Biology, Chemistry, Physics, Mathematics, English Language, Business Studies, Computer Science, Economics, and Geography.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does RevisionCity cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RevisionCity is completely free. Every feature — notes, flashcards, quizzes, AI Test Generator, AI Tutor, mock exams, study plans, and analytics — is unlocked for everyone with no subscription required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the content aligned to the Cambridge and Edexcel syllabuses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. RevisionCity covers both Cambridge IGCSE and Edexcel IGCSE specifications. You can filter content by exam board when you browse subjects.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the AI Test Generator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The AI Test Generator creates custom practice tests on any topic you choose. Perfect for targeting specific areas you need to improve!',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Revision City work on mobile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Our platform is fully responsive and works great on phones, tablets, and computers.',
      },
    },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
