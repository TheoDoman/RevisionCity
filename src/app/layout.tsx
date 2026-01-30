import type { Metadata } from 'next';
import { Outfit, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';

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

export const metadata: Metadata = {
  title: 'Revision City | IGCSE Revision Made Simple',
  description:
    'The ultimate IGCSE revision platform. Master every subject with AI-powered notes, flashcards, quizzes, and more.',
  keywords: [
    'IGCSE',
    'revision',
    'Cambridge',
    'exam prep',
    'study',
    'flashcards',
    'quizzes',
  ],
  authors: [{ name: 'Revision City' }],
  openGraph: {
    title: 'Revision City | IGCSE Revision Made Simple',
    description:
      'The ultimate IGCSE revision platform. Master every subject with AI-powered notes, flashcards, quizzes, and more.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.NodeNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      >
        <body className="min-h-screen bg-surface-50 font-sans flex flex-col">
          {gaId && <GoogleAnalytics measurementId={gaId} />}
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
