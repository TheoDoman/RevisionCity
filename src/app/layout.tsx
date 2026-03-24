import type { Metadata } from 'next';
import { Outfit, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { PostHogProvider, PostHogPageView } from '@/components/PostHogProvider';
import { CookieConsent } from '@/components/CookieConsent';
import { AgeAcknowledgementSync } from '@/components/AgeAcknowledgementSync';

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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revisioncity.net';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'RevisionCity — Free IGCSE Revision Notes, Flashcards & Quizzes',
    template: '%s | RevisionCity',
  },
  description:
    'Revise for your IGCSE exams with free notes, flashcards, quizzes, and practice questions. Covering Cambridge and Edexcel subjects including Maths, Biology, Chemistry, Physics, and more.',
  keywords: [
    'IGCSE revision',
    'IGCSE notes',
    'Cambridge IGCSE',
    'Edexcel IGCSE',
    'IGCSE flashcards',
    'IGCSE quizzes',
    'IGCSE practice questions',
    'IGCSE Biology revision',
    'IGCSE Chemistry revision',
    'IGCSE Physics revision',
    'IGCSE Maths revision',
    'free IGCSE revision',
    'IGCSE exam preparation',
  ],
  authors: [{ name: 'RevisionCity' }],
  openGraph: {
    title: 'RevisionCity — Free IGCSE Revision Notes, Flashcards & Quizzes',
    description:
      'Revise for your IGCSE exams with free notes, flashcards, quizzes, and practice questions. Covering Cambridge and Edexcel subjects.',
    type: 'website',
    siteName: 'RevisionCity',
    url: BASE_URL,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RevisionCity — Free IGCSE Revision',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RevisionCity — Free IGCSE Revision Notes, Flashcards & Quizzes',
    description:
      'Free IGCSE revision notes, flashcards, quizzes and practice questions for Cambridge and Edexcel.',
    images: ['/og-image.png'],
  },
  // No global canonical here — each page sets its own via generateMetadata
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
              __html: JSON.stringify([
                {
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: 'RevisionCity',
                  url: BASE_URL,
                  logo: `${BASE_URL}/logo.png`,
                  description:
                    'Free IGCSE revision platform with notes, flashcards, quizzes, practice questions, and AI-powered tools for Cambridge and Edexcel students.',
                },
                {
                  '@context': 'https://schema.org',
                  '@type': 'WebSite',
                  name: 'RevisionCity',
                  url: BASE_URL,
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: `${BASE_URL}/subjects?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                  },
                },
              ]),
            }}
          />
          {/* Plausible — cookie-free, GDPR-compliant, loads unconditionally */}
          <Script
            defer
            data-domain="revisioncity.net"
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
          {gaId && <GoogleAnalytics measurementId={gaId} />}
          <PostHogProvider>
            <PostHogPageView />
            <Header />
            <AgeAcknowledgementSync />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
