import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description:
    'Answers to common questions about Revision City. Learn about pricing, features, IGCSE subjects, the AI Test Generator, and more.',
  keywords: ['IGCSE revision FAQ', 'Revision City help', 'IGCSE study platform'],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Revision City?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Revision City is an IGCSE revision platform that provides comprehensive study materials including notes, flashcards, quizzes, and AI-powered tools to help you ace your exams.',
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
      name: 'How much does Revision City cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer three tiers: Free Trial (1 day), Pro (€4.99/month or €39.99/year), and Premium (€7.99/month or €63.99/year). Annual plans save you 33%!',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the content aligned to the Cambridge syllabus?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! All our content is carefully aligned to the latest Cambridge IGCSE syllabus specifications.',
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
