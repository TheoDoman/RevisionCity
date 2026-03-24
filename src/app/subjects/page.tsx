import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getSubjectIcon, getSubjectColor } from '@/lib/utils';
import { getSubjects } from '@/lib/data';
import { Suspense } from 'react';
import { ExamBoardToggle } from '@/components/ExamBoardToggle';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revisioncity.com';

// ISR: rebuild at most once per hour
export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}): Promise<Metadata> {
  const { board } = await searchParams;
  const examBoard = board === 'edexcel' ? 'edexcel' : 'cambridge';
  const boardLabel = examBoard === 'edexcel' ? 'Edexcel' : 'Cambridge';

  return {
    title: `${boardLabel} IGCSE Subjects - Revision Notes & Resources`,
    description:
      `Browse ${boardLabel} IGCSE subjects. Free revision notes, flashcards, quizzes, and AI-powered practice for Mathematics, Biology, Chemistry, Physics, and more.`,
    keywords: [
      'IGCSE subjects',
      `${boardLabel} IGCSE revision`,
      'IGCSE notes',
      'IGCSE revision materials',
    ],
    alternates: {
      canonical: examBoard === 'edexcel'
        ? `${BASE_URL}/subjects?board=edexcel`
        : `${BASE_URL}/subjects`,
    },
  };
}

// Fallback subjects for when database is empty
const fallbackSubjects = [
  { id: '1', name: 'Mathematics', slug: 'mathematics', description: 'Numbers, algebra, geometry, statistics and more.', topic_count: 12, icon: '📐', color: 'from-blue-500 to-indigo-600', created_at: '' },
  { id: '2', name: 'Biology', slug: 'biology', description: 'The study of living organisms and life processes.', topic_count: 15, icon: '🧬', color: 'from-green-500 to-emerald-600', created_at: '' },
  { id: '3', name: 'Chemistry', slug: 'chemistry', description: 'Elements, compounds, reactions and matter.', topic_count: 14, icon: '⚗️', color: 'from-purple-500 to-violet-600', created_at: '' },
  { id: '4', name: 'Physics', slug: 'physics', description: 'Forces, energy, waves, electricity and magnetism.', topic_count: 13, icon: '⚛️', color: 'from-cyan-500 to-blue-600', created_at: '' },
  { id: '5', name: 'Computer Science', slug: 'computer-science', description: 'Programming, algorithms, data structures and computer systems.', topic_count: 10, icon: '💻', color: 'from-indigo-500 to-purple-600', created_at: '' },
  { id: '6', name: 'Business Studies', slug: 'business', description: 'Business concepts, management, finance and enterprise.', topic_count: 8, icon: '💼', color: 'from-slate-500 to-gray-600', created_at: '' },
  { id: '7', name: 'Economics', slug: 'economics', description: 'Micro and macroeconomics, markets and government policy.', topic_count: 9, icon: '📈', color: 'from-teal-500 to-cyan-600', created_at: '' },
  { id: '8', name: 'History', slug: 'history', description: '20th century world history and historical skills.', topic_count: 11, icon: '🏛️', color: 'from-yellow-500 to-amber-600', created_at: '' },
  { id: '9', name: 'Geography', slug: 'geography', description: 'Physical and human geography, environmental management.', topic_count: 10, icon: '🌍', color: 'from-lime-500 to-green-600', created_at: '' },
];

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  const { board } = await searchParams;
  const examBoard = board === 'edexcel' ? 'edexcel' : 'cambridge';

  // Try to fetch from Supabase, fall back to mock data
  let subjects = await getSubjects(examBoard);

  if (subjects.length === 0 && examBoard === 'cambridge') {
    subjects = fallbackSubjects;
  }

  const boardLabel = examBoard === 'edexcel' ? 'Edexcel' : 'Cambridge';
  const boardDesc =
    examBoard === 'edexcel'
      ? 'Edexcel IGCSE'
      : 'Cambridge IGCSE';

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-brand-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-30 animate-float-slow" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4 animate-slide-in-left">
            <div className="p-2 bg-brand-100 rounded-xl hover-rotate animate-bounce-soft">
              <BookOpen className="h-6 w-6 text-brand-600" />
            </div>
            <span className="text-sm font-medium text-brand-600">{boardDesc}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-brand-950 mb-4 animate-slide-up">
                Choose Your Subject
              </h1>
              <p className="text-lg text-brand-600 max-w-2xl animate-slide-up animation-delay-100">
                Select a subject to start revising. Each subject contains comprehensive
                revision materials aligned to the {boardDesc} syllabus.
              </p>
            </div>
            <div className="animate-slide-up animation-delay-100 shrink-0">
              <Suspense>
                <ExamBoardToggle current={examBoard} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {subjects.length === 0 ? (
          <div className="text-center py-16 text-brand-500">
            <p className="text-lg">No {boardLabel} subjects available yet.</p>
            <p className="text-sm mt-2">Check back soon or switch to Cambridge.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, index) => {
              const baseSlug = subject.slug.endsWith('-edexcel')
                ? subject.slug.replace(/-edexcel$/, '')
                : subject.slug;
              const cardHref = `/subject/${examBoard}/${baseSlug}`;
              return (
              <Link
                key={subject.id}
                href={cardHref}
                className="group relative bg-white rounded-2xl border-2 border-brand-100
                         overflow-hidden transition-all duration-300
                         hover-lift hover-glow hover:border-brand-200 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getSubjectColor(baseSlug)}
                            opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Board badge */}
                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${
                  examBoard === 'edexcel' ? 'bg-[#6A0DAD]' : 'bg-[#003865]'
                }`}>
                  {examBoard === 'edexcel' ? 'Edexcel' : 'Cambridge'}
                </div>

                <div className="relative p-6">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${getSubjectColor(baseSlug)}
                                  bg-opacity-10 group-hover:scale-125 group-hover:rotate-12
                                  transition-all duration-300 animate-float`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {getSubjectIcon(baseSlug)}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-xl font-semibold text-brand-900
                                   group-hover:text-brand-950 transition-colors">
                        {subject.name}
                      </h2>
                      <p className="text-sm text-brand-500">{subject.topic_count} topics</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-brand-600 text-sm leading-relaxed mb-4">
                    {subject.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center text-brand-600 group-hover:text-brand-800
                                font-medium text-sm transition-colors">
                    Start revising
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
