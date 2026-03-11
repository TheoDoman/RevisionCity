import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTopicWithSubtopics, getTopicBySlug, getAllRevisionContent } from '@/lib/data';
import { TopicPageClient } from '@/components/TopicPageClient';
import type { Subject, Topic, Subtopic } from '@/types';

// Fallback subtopics for when database is empty
const fallbackSubtopics = [
  { id: '1', name: 'Introduction & Key Concepts', slug: 'introduction', description: 'Core definitions and fundamental principles', order_index: 0, learning_objectives: [], created_at: '' },
  { id: '2', name: 'Main Theory', slug: 'main-theory', description: 'Detailed explanation of the main theory', order_index: 1, learning_objectives: [], created_at: '' },
  { id: '3', name: 'Applications', slug: 'applications', description: 'Real-world applications and examples', order_index: 2, learning_objectives: [], created_at: '' },
  { id: '4', name: 'Calculations & Formulas', slug: 'calculations', description: 'Key formulas and how to use them', order_index: 3, learning_objectives: [], created_at: '' },
  { id: '5', name: 'Exam Techniques', slug: 'exam-techniques', description: 'How to answer exam questions', order_index: 4, learning_objectives: [], created_at: '' },
];

const validSubjects = ['mathematics', 'biology', 'chemistry', 'physics'];

function formatSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}): Promise<Metadata> {
  const { slug, topic: topicSlug } = await params;
  const result = await getTopicBySlug(slug, topicSlug, 'edexcel');

  const subjectName = result?.subject.name || formatSlug(slug);
  const topicName = result?.topic.name || formatSlug(topicSlug);

  const title = `${topicName} - Edexcel IGCSE ${subjectName} Revision | Revision City`;
  const description = `Revise ${topicName} for Edexcel IGCSE ${subjectName}. Notes, flashcards, quizzes, practice questions, and mind maps aligned to the Edexcel IGCSE syllabus.${result?.topic.description ? ` ${result.topic.description}` : ''}`;

  return {
    title,
    description,
    keywords: [
      `Edexcel IGCSE ${subjectName} ${topicName}`,
      `${topicName} revision Edexcel`,
      `Edexcel ${topicName} notes`,
      `Edexcel IGCSE ${topicName}`,
      `${subjectName} ${topicName} Edexcel flashcards`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function EdexcelTopicPage({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}) {
  const { slug, topic: topicSlug } = await params;

  if (!validSubjects.includes(slug)) {
    notFound();
  }

  // Try to fetch from Supabase (Edexcel board)
  const data = await getTopicWithSubtopics(slug, topicSlug, 'edexcel');

  // Create fallback subject and topic if not found
  const subject: Subject = data?.subject || {
    id: slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug,
    description: '',
    icon: '',
    color: '',
    topic_count: 0,
    exam_board: 'edexcel',
    created_at: '',
  };

  const topic: Topic = data?.topic || {
    id: topicSlug,
    subject_id: slug,
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

  // Fetch revision content for the first subtopic
  let initialContent = null;
  if (subtopics.length > 0) {
    try {
      initialContent = await getAllRevisionContent(subtopics[0].id, topic.id);
    } catch (error) {
      console.error('Error fetching initial content:', error);
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `${topic.name} - Edexcel IGCSE ${subject.name}`,
    description: topic.description || `Revision materials for ${topic.name} in Edexcel IGCSE ${subject.name}`,
    educationalLevel: 'IGCSE',
    learningResourceType: ['Notes', 'Flashcards', 'Quiz', 'Practice Questions'],
    isPartOf: {
      '@type': 'Course',
      name: `Edexcel IGCSE ${subject.name}`,
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Revision City',
      },
    },
  };

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
      />
    </>
  );
}
