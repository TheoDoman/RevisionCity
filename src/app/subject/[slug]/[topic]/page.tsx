import { notFound } from 'next/navigation';
import { getTopicWithSubtopics, getAllRevisionContent } from '@/lib/data';
import { TopicPageClient } from '@/components/TopicPageClient';
import type { Subject, Topic, Subtopic } from '@/types';

// Fallback data for when database is empty
const fallbackSubtopics = [
  { id: '1', name: 'Introduction & Key Concepts', slug: 'introduction', description: 'Core definitions and fundamental principles', order_index: 0, learning_objectives: [], created_at: '' },
  { id: '2', name: 'Main Theory', slug: 'main-theory', description: 'Detailed explanation of the main theory', order_index: 1, learning_objectives: [], created_at: '' },
  { id: '3', name: 'Applications', slug: 'applications', description: 'Real-world applications and examples', order_index: 2, learning_objectives: [], created_at: '' },
  { id: '4', name: 'Calculations & Formulas', slug: 'calculations', description: 'Key formulas and how to use them', order_index: 3, learning_objectives: [], created_at: '' },
  { id: '5', name: 'Exam Techniques', slug: 'exam-techniques', description: 'How to answer exam questions', order_index: 4, learning_objectives: [], created_at: '' },
];

const validSubjects = ['mathematics', 'english', 'biology', 'chemistry', 'physics', 'computer-science', 'business-studies', 'economics', 'history', 'geography'];

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string; topic: string }>;
}) {
  const { slug, topic: topicSlug } = await params;

  if (!validSubjects.includes(slug)) {
    notFound();
  }

  // Try to fetch from Supabase
  const data = await getTopicWithSubtopics(slug, topicSlug);

  // Create fallback subject and topic if not found
  const subject: Subject = data?.subject || {
    id: slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug,
    description: '',
    icon: '',
    color: '',
    topic_count: 0,
    created_at: '',
  };

  const topic: Topic = data?.topic || {
    id: topicSlug,
    subject_id: slug,
    name: topicSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
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
      console.log('SERVER: Fetched content for', subtopics[0].name, ':', {
        notes: !!initialContent?.notes,
        flashcards: initialContent?.flashcards?.length || 0,
        quizQuestions: initialContent?.quizQuestions?.length || 0,
        practiceQuestions: initialContent?.practiceQuestions?.length || 0,
        recallPrompts: initialContent?.recallPrompts?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching initial content:', error);
    }
  }

  return (
    <TopicPageClient
      subject={subject}
      topic={topic}
      subtopics={subtopics}
      initialContent={initialContent}
    />
  );
}
