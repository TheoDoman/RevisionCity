import type { Metadata } from 'next';
import { Outfit, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { PostHogProvider, PostHogPageView } from '@/components/PostHogProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revisioncity.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Revision City | IGCSE Revision Made Simple',
    template: '%s | Revision City',
  },
  description:
    'The ultimate IGCSE revision platform. Master every subject with AI-powered notes, flashcards, quizzes, and more. Aligned to the Cambridge IGCSE syllabus.',
  keywords: [
    'IGCSE',
    'IGCSE revision',
    'Cambridge IGCSE',
    'IGCSE notes',
    'IGCSE past papers',
    'exam prep',
    'study',
    'flashcards',
    'quizzes',
    'IGCSE Biology',
    'IGCSE Chemistry',
    'IGCSE Physics',
    'IGCSE Maths',
  ],
  authors: [{ name: 'Revision City' }],
  openGraph: {
    title: 'Revision City | IGCSE Revision Made Simple',
    description:
      'The ultimate IGCSE revision platform. Master every subject with AI-powered notes, flashcards, quizzes, and more.',
    type: 'website',
    siteName: 'Revision City',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revision City | IGCSE Revision Made Simple',
    description:
      'Master every IGCSE subject with AI-powered notes, flashcards, quizzes, and more.',
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      >
        <body className="min-h-screen bg-surface-50 font-sans flex flex-col">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'EducationalOrganization',
                name: 'Revision City',
                url: BASE_URL,
                description:
                  'AI-powered IGCSE revision platform with notes, flashcards, quizzes, and practice questions for all Cambridge IGCSE subjects.',
                sameAs: [],
              }),
            }}
          />
          {gaId && <GoogleAnalytics measurementId={gaId} />}
          <PostHogProvider>
            <PostHogPageView />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
