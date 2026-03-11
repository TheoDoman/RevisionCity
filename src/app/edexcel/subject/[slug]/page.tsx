import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getSubjectIcon, getSubjectColor } from '@/lib/utils';
import { getSubjectWithTopics, getSubjectBySlug } from '@/lib/data';

// Edexcel IGCSE fallback topics per subject
const fallbackTopics: Record<string, { name: string; slug: string; description: string; subtopic_count: number }[]> = {
  mathematics: [
    { name: 'Number', slug: 'number', description: 'Integers, fractions, decimals, percentages, surds, standard form', subtopic_count: 8 },
    { name: 'Algebra', slug: 'algebra', description: 'Expressions, equations, quadratics, inequalities, sequences', subtopic_count: 8 },
    { name: 'Geometry', slug: 'geometry', description: 'Angles, polygons, circles, Pythagoras, trigonometry, 3D shapes', subtopic_count: 8 },
    { name: 'Statistics and Probability', slug: 'statistics-and-probability', description: 'Data representation, averages, probability, combined events', subtopic_count: 6 },
    { name: 'Vectors and Transformation Geometry', slug: 'vectors-and-transformation-geometry', description: 'Column vectors, transformations, matrices', subtopic_count: 5 },
  ],
  biology: [
    { name: 'The Nature and Variety of Living Organisms', slug: 'nature-and-variety-of-living-organisms', description: 'Characteristics of life, classification, unicellular organisms', subtopic_count: 5 },
    { name: 'Structures and Functions in Living Organisms', slug: 'structures-and-functions', description: 'Cells, nutrition, respiration, gas exchange, excretion, nervous system', subtopic_count: 8 },
    { name: 'Reproduction and Inheritance', slug: 'reproduction-and-inheritance', description: 'Cell division, sexual/asexual reproduction, genetics, evolution', subtopic_count: 6 },
    { name: 'Ecology and the Environment', slug: 'ecology-and-the-environment', description: 'Ecosystems, energy flow, nutrient cycles, human impact', subtopic_count: 5 },
    { name: 'Use of Biological Resources', slug: 'use-of-biological-resources', description: 'Food production, selective breeding, genetic engineering, microorganisms', subtopic_count: 5 },
  ],
  chemistry: [
    { name: 'Principles of Chemistry', slug: 'principles-of-chemistry', description: 'Atomic structure, periodic table, bonding, formulae and equations', subtopic_count: 8 },
    { name: 'Chemistry of the Elements', slug: 'chemistry-of-the-elements', description: 'Groups 1, 7 and 0, transition metals, acids, bases and salts', subtopic_count: 8 },
    { name: 'Organic Chemistry', slug: 'organic-chemistry', description: 'Alkanes, alkenes, alcohols, carboxylic acids, polymers', subtopic_count: 6 },
    { name: 'Physical Chemistry', slug: 'physical-chemistry', description: 'Energetics, rates of reaction, reversible reactions, electrochemistry', subtopic_count: 6 },
    { name: 'Chemistry in Society', slug: 'chemistry-in-society', description: 'Extraction of metals, ammonia, water treatment, air pollution', subtopic_count: 5 },
  ],
  physics: [
    { name: 'Forces and Motion', slug: 'forces-and-motion', description: 'Speed, velocity, acceleration, Newton\'s laws, momentum', subtopic_count: 6 },
    { name: 'Electricity', slug: 'electricity', description: 'Circuits, resistance, Ohm\'s law, series and parallel, electrical power', subtopic_count: 6 },
    { name: 'Waves', slug: 'waves', description: 'Transverse and longitudinal waves, sound, light, electromagnetic spectrum', subtopic_count: 5 },
    { name: 'Energy Resources and Energy Transfer', slug: 'energy-resources-and-transfer', description: 'Thermal energy, conduction, convection, radiation, renewable energy', subtopic_count: 5 },
    { name: 'Solids, Liquids and Gases', slug: 'solids-liquids-and-gases', description: 'Density, pressure, gas laws, kinetic theory', subtopic_count: 5 },
    { name: 'Magnetism and Electromagnetism', slug: 'magnetism-and-electromagnetism', description: 'Magnetic fields, electromagnets, motors, generators, transformers', subtopic_count: 5 },
    { name: 'Radioactivity and Particles', slug: 'radioactivity-and-particles', description: 'Atomic model, nuclear radiation, half-life, fission, fusion', subtopic_count: 5 },
    { name: 'Astrophysics', slug: 'astrophysics', description: 'Solar system, stars, galaxies, Big Bang, red-shift', subtopic_count: 4 },
  ],
};

const validSlugs = ['mathematics', 'biology', 'chemistry', 'physics'];

const subjectDisplayNames: Record<string, string> = {
  mathematics: 'Mathematics A',
  biology: 'Biology',
  chemistry: 'Chemistry',
  physics: 'Physics',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug, 'edexcel');
  const name = subject?.name || subjectDisplayNames[slug] || slug;

  const title = `Edexcel IGCSE ${name} Revision Notes & Practice | Revision City`;
  const description = `Free Edexcel IGCSE ${name} revision notes, flashcards, quizzes, and practice questions. Aligned to the Edexcel IGCSE ${name} syllabus. ${subject?.description || ''}`.trim();

  return {
    title,
    description,
    keywords: [
      `Edexcel IGCSE ${name}`,
      `Edexcel IGCSE ${name} revision`,
      `Edexcel IGCSE ${name} notes`,
      `Edexcel ${name}`,
      `${name} past papers Edexcel`,
      `${name} exam prep Edexcel`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function EdexcelSubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!validSlugs.includes(slug)) {
    notFound();
  }

  // Try to fetch from Supabase
  const data = await getSubjectWithTopics(slug, 'edexcel');

  // Use fetched data or fallback
  const subject = data?.subject || {
    id: slug,
    name: subjectDisplayNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1),
    slug,
    description: `Comprehensive Edexcel IGCSE ${slug} revision materials.`,
    topic_count: fallbackTopics[slug]?.length || 5,
    icon: getSubjectIcon(slug),
    color: getSubjectColor(slug),
    exam_board: 'edexcel',
    created_at: '',
  };

  const topics = data?.topics.length
    ? data.topics
    : (fallbackTopics[slug] || [
        { name: 'Topic 1', slug: 'topic-1', description: 'Coming soon', subtopic_count: 5 },
        { name: 'Topic 2', slug: 'topic-2', description: 'Coming soon', subtopic_count: 5 },
      ]).map((t, i) => ({ ...t, id: String(i + 1), subject_id: subject.id, order_index: i, created_at: '' }));

  const color = getSubjectColor(slug);
  const icon = getSubjectIcon(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `Edexcel IGCSE ${subject.name}`,
    description: subject.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Revision City',
    },
    educationalLevel: 'IGCSE',
    about: {
      '@type': 'Thing',
      name: `Edexcel IGCSE ${subject.name}`,
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
            href="/subjects?board=edexcel"
            className="inline-flex items-center text-sm text-brand-600 hover:text-brand-800
                     transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Subjects
          </Link>

          {/* Edexcel badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 border border-brand-200 rounded-full text-xs font-medium text-brand-600 mb-4">
            Edexcel IGCSE
          </div>

          <div className="flex items-start gap-6">
            <div className={`text-6xl p-4 rounded-2xl bg-gradient-to-br ${color} bg-opacity-20`}>
              {icon}
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-brand-950 mb-2">
                {subject.name}
              </h1>
              <p className="text-lg text-brand-600 max-w-2xl">{subject.description}</p>
              <p className="text-sm text-brand-500 mt-2">
                {topics.length} topics •{' '}
                {topics.reduce((acc, t) => acc + (t.subtopic_count || 0), 0)} subtopics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display text-2xl font-bold text-brand-950 mb-6">Topics</h2>

        <div className="space-y-4">
          {topics.map((topic, index) => (
            <Link
              key={topic.id || index}
              href={`/edexcel/subject/${slug}/${topic.slug}`}
              className="group block bg-white rounded-xl border-2 border-brand-100
                       hover:border-brand-200 hover:shadow-lg transition-all duration-300
                       animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color}
                                flex items-center justify-center text-white font-bold
                                group-hover:scale-110 transition-transform duration-300`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-brand-900 group-hover:text-brand-950 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-sm text-brand-500">
                      {topic.subtopic_count} subtopics • {topic.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-brand-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
