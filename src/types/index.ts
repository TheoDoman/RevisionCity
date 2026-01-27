// Database types
export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  topic_count: number;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
  subtopic_count: number;
  created_at: string;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
  learning_objectives: string[];
  created_at: string;
}

// Content types for each revision method
export interface Note {
  id: string;
  subtopic_id: string;
  title: string;
  content: string; // Markdown content
  key_points: string[];
  created_at: string;
}

export interface Flashcard {
  id: string;
  subtopic_id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface FlashcardSet {
  id: string;
  subtopic_id: string;
  name: string;
  flashcards: Flashcard[];
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  subtopic_id: string;
  question: string;
  question_type: 'multiple_choice' | 'fill_blank' | 'true_false';
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface Quiz {
  id: string;
  subtopic_id: string;
  name: string;
  questions: QuizQuestion[];
  created_at: string;
}

export interface PracticeQuestion {
  id: string;
  subtopic_id: string;
  question: string;
  marks: number;
  mark_scheme: string[];
  example_answer: string;
  difficulty: 'foundation' | 'higher' | 'extended';
  created_at: string;
}

export interface RecallPrompt {
  id: string;
  subtopic_id: string;
  prompt: string;
  hints: string[];
  model_answer: string;
  key_points_to_include: string[];
  created_at: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface MindMap {
  id: string;
  topic_id: string;
  name: string;
  root: MindMapNode;
  created_at: string;
}

export interface SummarySheet {
  id: string;
  topic_id: string;
  title: string;
  key_concepts: string[];
  definitions: { term: string; definition: string }[];
  formulas?: { name: string; formula: string; usage: string }[];
  diagrams?: { name: string; description: string }[];
  exam_tips: string[];
  created_at: string;
}

// Subscription types
export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at?: string;
  created_at: string;
}

// Usage tracking (for free tier limits)
export interface UsageTracker {
  subtopics_accessed: string[];
  quizzes_taken_today: number;
  flashcards_reviewed_today: number;
  last_reset: string;
}

// UI State types
export interface RevisionProgress {
  subtopic_id: string;
  notes_read: boolean;
  flashcards_reviewed: number;
  quiz_best_score: number;
  practice_questions_completed: number;
  recall_prompts_completed: number;
}
