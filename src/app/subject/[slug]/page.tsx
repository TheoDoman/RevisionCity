import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getSubjectIcon, getSubjectColor } from '@/lib/utils';
import { getSubjectWithTopics, getSubjectBySlug } from '@/lib/data';

// Fallback data
const fallbackTopics: Record<string, { name: string; slug: string; description: string; subtopic_count: number }[]> = {
  mathematics: [
    { name: 'Number', slug: 'number', description: 'Integers, fractions, decimals, percentages', subtopic_count: 8 },
    { name: 'Algebra', slug: 'algebra', description: 'Expressions, equations, inequalities, sequences', subtopic_count: 12 },
    { name: 'Geometry', slug: 'geometry', description: 'Shapes, angles, transformations, vectors', subtopic_count: 10 },
    { name: 'Statistics', slug: 'statistics', description: 'Data handling, averages, probability', subtopic_count: 6 },
    { name: 'Functions', slug: 'functions', description: 'Linear, quadratic, exponential functions', subtopic_count: 8 },
  ],
  biology: [
    { name: 'Cells', slug: 'cells', description: 'Cell structure, division, and organisation', subtopic_count: 6 },
    { name: 'Human Biology', slug: 'human-biology', description: 'Nutrition, respiration, circulation, excretion', subtopic_count: 10 },
    { name: 'Plant Biology', slug: 'plant-biology', description: 'Photosynthesis, transport, reproduction', subtopic_count: 8 },
    { name: 'Ecology', slug: 'ecology', description: 'Ecosystems, food chains, human impact', subtopic_count: 5 },
    { name: 'Genetics', slug: 'genetics', description: 'Inheritance, DNA, variation, evolution', subtopic_count: 7 },
  ],
  chemistry: [
    { name: 'Atomic Structure', slug: 'atomic-structure', description: 'Atoms, elements, periodic table', subtopic_count: 5 },
    { name: 'Bonding', slug: 'bonding', description: 'Ionic, covalent, metallic bonding', subtopic_count: 6 },
    { name: 'Stoichiometry', slug: 'stoichiometry', description: 'Moles, equations, calculations', subtopic_count: 7 },
    { name: 'Reactions', slug: 'reactions', description: 'Acids, bases, redox, rates', subtopic_count: 9 },
    { name: 'Organic Chemistry', slug: 'organic-chemistry', description: 'Hydrocarbons, polymers, alcohols', subtopic_count: 8 },
  ],
  physics: [
    { name: 'Forces & Motion', slug: 'forces-motion', description: 'Speed, acceleration, Newton\'s laws', subtopic_count: 8 },
    { name: 'Energy', slug: 'energy', description: 'Energy transfers, work, power, efficiency', subtopic_count: 6 },
    { name: 'Waves', slug: 'waves', description: 'Sound, light, electromagnetic spectrum', subtopic_count: 7 },
    { name: 'Electricity', slug: 'electricity', description: 'Circuits, resistance, power', subtopic_count: 9 },
    { name: 'Magnetism', slug: 'magnetism', description: 'Magnetic fields, electromagnets, motors', subtopic_count: 5 },
  ],
};

const validSlugs = ['mathematics', 'english', 'biology', 'chemistry', 'physics', 'computer-science', 'business-studies', 'economics', 'history', 'geography'];

// Allow Edexcel variants (slug ends with -edexcel)
function isValidSlug(slug: string) {
  return validSlugs.includes(slug) || slug.endsWith('-edexcel');
}

const subjectDisplayNames: Record<string, string> = {
  mathematics: 'Mathematics',
  english: 'English',
  biology: 'Biology',
  chemistry: 'Chemistry',
  physics: 'Physics',
  'computer-science': 'Computer Science',
  'business-studies': 'Business Studies',
  economics: 'Economics',
  history: 'History',
  geography: 'Geography',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  const name = subject?.name || subjectDisplayNames[slug] || slug;

  const title = `IGCSE ${name} Revision Notes & Practice | Revision City`;
  const description = `Free IGCSE ${name} revision notes, flashcards, quizzes, and practice questions. Aligned to the Cambridge IGCSE ${name} syllabus. ${subject?.description || ''}`.trim();

  return {
    title,
    description,
    keywords: [
      `IGCSE ${name}`,
      `IGCSE ${name} revision`,
      `IGCSE ${name} notes`,
      `Cambridge IGCSE ${name}`,
      `${name} past papers`,
      `${name} exam prep`,
      `${name} flashcards`,
      `${name} quizzes`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  // Try to fetch from Supabase
  const data = await getSubjectWithTopics(slug);

  // Use fetched data or fallback
  const subject = data?.subject || {
    id: slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug,
    description: `Comprehensive ${slug} revision materials.`,
    topic_count: 5,
    icon: getSubjectIcon(slug),
    color: getSubjectColor(slug),
    created_at: '',
  };

  const topics = data?.topics.length 
    ? data.topics 
    : (fallbackTopics[slug] || [
        { name: 'Topic 1', slug: 'topic-1', description: 'Coming soon', subtopic_count: 5 },
        { name: 'Topic 2', slug: 'topic-2', description: 'Coming soon', subtopic_count: 5 },
        { name: 'Topic 3', slug: 'topic-3', description: 'Coming soon', subtopic_count: 5 },
      ]).map((t, i) => ({ ...t, id: String(i + 1), subject_id: subject.id, order_index: i, created_at: '' }));

  const color = getSubjectColor(slug);
  const icon = getSubjectIcon(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `IGCSE ${subject.name}`,
    description: subject.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Revision City',
    },
    educationalLevel: 'IGCSE',
    about: {
      '@type': 'Thing',
      name: `Cambridge IGCSE ${subject.name}`,
    },
    hasCourseInstance: topics.map((topic) => ({
      '@type': 'CourseInstance',
      name: topic.name,
      description: topic.description,
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <Link
            href="/subjects"
            className="inline-flex items-center text-sm text-brand-600 hover:text-brand-800 
                     transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Subjects
          </Link>

          <div className="flex items-start gap-6">
            <div className={`text-6xl p-4 rounded-2xl bg-gradient-to-br ${color} bg-opacity-20`}>
              {icon}
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-brand-950 mb-2">
                {subject.name}
              </h1>
              <p className="text-lg text-brand-600 max-w-2xl">
                {subject.description}
              </p>
              <p className="text-sm text-brand-500 mt-2">
                {topics.length} topics • {topics.reduce((acc, t) => acc + (t.subtopic_count || 0), 0)} subtopics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display text-2xl font-bold text-brand-950 mb-6">
          Topics
        </h2>

        <div className="space-y-4">
          {topics.map((topic, index) => (
            <Link
              key={topic.id || index}
              href={`/subject/${slug}/${topic.slug}`}
              className="group block bg-white rounded-xl border-2 border-brand-100 
                       hover:border-brand-200 hover:shadow-lg transition-all duration-300
                       animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} 
                                flex items-center justify-center text-white font-bold
                                group-hover:scale-110 transition-transform duration-300`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-brand-900 
                                 group-hover:text-brand-950 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-sm text-brand-500">
                      {topic.subtopic_count} subtopics • {topic.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-brand-400 group-hover:text-brand-600 
                                       group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
