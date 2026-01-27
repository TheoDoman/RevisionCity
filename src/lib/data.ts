import { supabase } from './supabase';
import type {
  Subject,
  Topic,
  Subtopic,
  Note,
  Flashcard,
  QuizQuestion,
  PracticeQuestion,
  RecallPrompt,
  MindMap,
  SummarySheet,
} from '@/types';

// ============================================
// SUBJECTS
// ============================================

export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }

  return data || [];
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching subject:', error);
    return null;
  }

  return data;
}

// ============================================
// TOPICS
// ============================================

export async function getTopicsBySubject(subjectId: string): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .order('order_index');

  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }

  return data || [];
}

export async function getTopicBySlug(
  subjectSlug: string,
  topicSlug: string
): Promise<{ topic: Topic; subject: Subject } | null> {
  // First get the subject
  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject) return null;

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subject.id)
    .eq('slug', topicSlug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching topic:', error);
    return null;
  }

  return { topic: data, subject };
}

// ============================================
// SUBTOPICS
// ============================================

export async function getSubtopicsByTopic(topicId: string): Promise<Subtopic[]> {
  const { data, error } = await supabase
    .from('subtopics')
    .select('*')
    .eq('topic_id', topicId)
    .order('order_index');

  if (error) {
    console.error('Error fetching subtopics:', error);
    return [];
  }

  return data || [];
}

export async function getSubtopicBySlug(
  topicId: string,
  subtopicSlug: string
): Promise<Subtopic | null> {
  const { data, error } = await supabase
    .from('subtopics')
    .select('*')
    .eq('topic_id', topicId)
    .eq('slug', subtopicSlug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching subtopic:', error);
    return null;
  }

  return data;
}

// ============================================
// REVISION CONTENT
// ============================================

export async function getNotesBySubtopic(subtopicId: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching notes:', error);
    return null;
  }

  return data;
}

export async function getFlashcardsBySubtopic(subtopicId: string): Promise<Flashcard[]> {
  // First get the flashcard set for this subtopic
  const { data: flashcardSet } = await supabase
    .from('flashcard_sets')
    .select('id')
    .eq('subtopic_id', subtopicId)
    .maybeSingle();

  if (!flashcardSet) {
    return [];
  }

  // Then get the flashcards
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('flashcard_set_id', flashcardSet.id);

  if (error) {
    console.error('Error fetching flashcards:', error);
    return [];
  }

  return data || [];
}

export async function getQuizQuestionsBySubtopic(subtopicId: string): Promise<QuizQuestion[]> {
  // First get the quiz for this subtopic
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id')
    .eq('subtopic_id', subtopicId)
    .maybeSingle();

  if (!quiz) {
    return [];
  }

  // Then get the quiz questions
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quiz.id);

  if (error) {
    console.error('Error fetching quiz questions:', error);
    return [];
  }

  return data || [];
}

export async function getPracticeQuestionsBySubtopic(
  subtopicId: string
): Promise<PracticeQuestion[]> {
  const { data, error } = await supabase
    .from('practice_questions')
    .select('*')
    .eq('subtopic_id', subtopicId);

  if (error) {
    console.error('Error fetching practice questions:', error);
    return [];
  }

  return data || [];
}

export async function getRecallPromptsBySubtopic(subtopicId: string): Promise<RecallPrompt[]> {
  const { data, error } = await supabase
    .from('recall_prompts')
    .select('*')
    .eq('subtopic_id', subtopicId);

  if (error) {
    console.error('Error fetching recall prompts:', error);
    return [];
  }

  return data || [];
}

export async function getMindMapByTopic(topicId: string): Promise<MindMap | null> {
  const { data, error } = await supabase
    .from('mind_maps')
    .select('*')
    .eq('topic_id', topicId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching mind map:', error);
    return null;
  }

  // Transform root_node from DB to root for frontend
  if (data) {
    return {
      ...data,
      root: data.root_node,
    };
  }

  return null;
}

export async function getSummarySheetByTopic(topicId: string): Promise<SummarySheet | null> {
  const { data, error } = await supabase
    .from('summary_sheets')
    .select('*')
    .eq('topic_id', topicId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching summary sheet:', error);
    return null;
  }

  return data;
}

// ============================================
// COMBINED DATA FETCHING
// ============================================

export async function getSubjectWithTopics(slug: string): Promise<{
  subject: Subject;
  topics: (Topic & { subtopic_count: number })[];
} | null> {
  const subject = await getSubjectBySlug(slug);
  if (!subject) return null;

  const topics = await getTopicsBySubject(subject.id);

  // Get subtopic counts for each topic
  const topicsWithCounts = await Promise.all(
    topics.map(async (topic) => {
      const { count } = await supabase
        .from('subtopics')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topic.id);

      return {
        ...topic,
        subtopic_count: count || 0
      };
    })
  );

  return { subject, topics: topicsWithCounts };
}

export async function getTopicWithSubtopics(
  subjectSlug: string,
  topicSlug: string
): Promise<{
  subject: Subject;
  topic: Topic;
  subtopics: Subtopic[];
} | null> {
  const result = await getTopicBySlug(subjectSlug, topicSlug);
  if (!result) return null;

  const subtopics = await getSubtopicsByTopic(result.topic.id);

  return {
    subject: result.subject,
    topic: result.topic,
    subtopics,
  };
}

export async function getAllRevisionContent(subtopicId: string, topicId: string): Promise<{
  notes: Note | null;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  practiceQuestions: PracticeQuestion[];
  recallPrompts: RecallPrompt[];
  mindMap: MindMap | null;
  summarySheet: SummarySheet | null;
}> {
  const [
    notes,
    flashcards,
    quizQuestions,
    practiceQuestions,
    recallPrompts,
    mindMap,
    summarySheet,
  ] = await Promise.all([
    getNotesBySubtopic(subtopicId),
    getFlashcardsBySubtopic(subtopicId),
    getQuizQuestionsBySubtopic(subtopicId),
    getPracticeQuestionsBySubtopic(subtopicId),
    getRecallPromptsBySubtopic(subtopicId),
    getMindMapByTopic(topicId),
    getSummarySheetByTopic(topicId),
  ]);

  return {
    notes,
    flashcards,
    quizQuestions,
    practiceQuestions,
    recallPrompts,
    mindMap,
    summarySheet,
  };
}
