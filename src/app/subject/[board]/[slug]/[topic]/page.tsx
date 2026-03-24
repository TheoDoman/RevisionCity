import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTopicWithSubtopics, getTopicBySlug, getAllRevisionContent } from '@/lib/data';
import { getDbSlug } from '@/lib/utils';
import { TopicPageClient } from '@/components/TopicPageClient';
import type { Subject, Topic, Subtopic } from '@/types';

// ISR: rebuild topic pages at most once per day
export const revalidate = 86400;

const validSlugs = ['mathematics', 'english', 'biology', 'chemistry', 'physics', 'computer-science', 'business-studies', 'economics', 'history', 'geography'];
const validBoards = ['cambridge', 'edexcel'];

const fallbackSubtopics = [
  { id: '1', name: 'Introduction & Key Concepts', slug: 'introduction', description: 'Core definitions and fundamental principles', order_index: 0, learning_objectives: [], created_at: '' },
  { id: '2', name: 'Main Theory', slug: 'main-theory', description: 'Detailed explanation of the main theory', order_index: 1, learning_objectives: [], created_at: '' },
  { id: '3', name: 'Applications', slug: 'applications', description: 'Real-world applications and examples', order_index: 2, learning_objectives: [], created_at: '' },
  { id: '4', name: 'Calculations & Formulas', slug: 'calculations', description: 'Key formulas and how to use them', order_index: 3, learning_objectives: [], created_at: '' },
  { id: '5', name: 'Exam Techniques', slug: 'exam-techniques', description: 'How to answer exam questions', order_index: 4, learning_objectives: [], created_at: '' },
];

function formatSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string; slug: string; topic: string }>;
}): Promise<Metadata> {
  const { board, slug, topic: topicSlug } = await params;
  const dbSlug = getDbSlug(board, slug);
  const result = await getTopicBySlug(dbSlug, topicSlug);
  const boardLabel = board === 'edexcel' ? 'Edexcel' : 'Cambridge';

  const subjectName = result?.subject.name || formatSlug(slug);
  const topicName = result?.topic.name || formatSlug(topicSlug);

  const title = `${topicName} — ${boardLabel} IGCSE ${subjectName} Revision | RevisionCity`;
  const description = `Revise ${topicName} for IGCSE ${subjectName}. Comprehensive notes, flashcards, practice questions, and quizzes to help you ace your exams.${result?.topic.description ? ` ${result.topic.description}` : ''}`;
  const canonical = `/subject/${board}/${slug}/${topicSlug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function BoardTopicPage({
  params,
}: {
  params: Promise<{ board: string; slug: string; topic: string }>;
}) {
  const { board, slug, topic: topicSlug } = await params;

  if (!validBoards.includes(board) || !validSlugs.includes(slug)) {
    notFound();
  }

  const dbSlug = getDbSlug(board, slug);
  const data = await getTopicWithSubtopics(dbSlug, topicSlug);

  const subject: Subject = data?.subject || {
    id: dbSlug,
    name: formatSlug(slug),
    slug: dbSlug,
    description: '',
    icon: '',
    color: '',
    topic_count: 0,
    created_at: '',
  };

  const topic: Topic = data?.topic || {
    id: topicSlug,
    subject_id: dbSlug,
    name: formatSlug(topicSlug),
    slug: topicSlug,
    description: '',
    order_index: 0,
    subtopic_count: 5,
    created_at: '',
  };

  const subtopics: Subtopic[] = data?.subtopics?.length
    ? data.subtopics
    : fallbackSubtopics.map(s => ({ ...s, topic_id: topic.id }));

  let initialContent = null;
  if (subtopics.length > 0) {
    try {
      initialContent = await getAllRevisionContent(subtopics[0].id, topic.id);
    } catch (error) {
      console.error('Error fetching initial content:', error);
    }
  }

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revisioncity.net';
  const boardLabel = board === 'edexcel' ? 'Edexcel' : 'Cambridge';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: `${topic.name} — IGCSE ${subject.name}`,
      description: topic.description || `Revision materials for ${topic.name} in IGCSE ${subject.name}`,
      educationalLevel: 'IGCSE',
      learningResourceType: ['Notes', 'Flashcards', 'Quiz', 'Practice Questions'],
      isPartOf: {
        '@type': 'Course',
        name: `${boardLabel} IGCSE ${subject.name}`,
        provider: { '@type': 'Organization', name: 'RevisionCity' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: subject.name, item: `${BASE_URL}/subject/${board}/${slug}` },
        { '@type': 'ListItem', position: 3, name: topic.name, item: `${BASE_URL}/subject/${board}/${slug}/${topicSlug}` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TopicPageClient
        subject={subject}
        topic={topic}
        subtopics={subtopics}
        initialContent={initialContent}
        board={board as 'cambridge' | 'edexcel'}
      />
    </>
  );
}
