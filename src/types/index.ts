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

// Revision Plan types
export type IGCSEGrade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'U';
export type ContentType = 'notes' | 'flashcards' | 'quiz' | 'practice' | 'recall';
export type TopicPriority = 'high' | 'medium' | 'low';

export interface TopicAllocation {
  topicId: string;
  topicName: string;
  hours: number;
  contentTypes: ContentType[];
  priority: TopicPriority;
}

export interface WeekPlan {
  week: number;
  estimatedGrade: IGCSEGrade;
  estimatedPercentage: number;
  isCheckpoint: boolean;
  topicAllocations: TopicAllocation[];
}

export interface PlanCheckpoint {
  week: number;
  focusTopicIds: string[];
  description: string;
}

export interface GradeProgressionPoint {
  week: number;
  grade: IGCSEGrade;
  percentage: number;
}

export interface RevisionPlan {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  examBoard: string;
  examDate: string;
  createdAt: string;
  updatedAt: string;
  totalWeeks: number;
  estimatedFinalGrade: IGCSEGrade;
  targetGrade: IGCSEGrade;
  hoursPerWeek: number;
  weeks: WeekPlan[];
  checkpoints: PlanCheckpoint[];
  gradeProgression: GradeProgressionPoint[];
}

// Mock Exam types
export type ExamQuestionType = 'multiple_choice' | 'short_answer' | 'extended_response'
export type ExamDifficulty = 'easy' | 'medium' | 'hard' | 'mixed'

export interface ExamQuestion {
  id: string
  type: ExamQuestionType
  text: string
  marks: number
  topic: string
  options?: string[]       // MC only — 4 options like "A. ...", "B. ..."
  correctAnswer?: string   // Stored in DB, NOT sent to client during exam
  markScheme: string[]
  modelAnswer?: string
}

// Version sent to the client — no correct answers exposed
export type ExamQuestionPublic = Omit<ExamQuestion, 'correctAnswer' | 'markScheme' | 'modelAnswer'>

export interface ExamSection {
  id: string
  name: string
  timeMinutes: number
  totalMarks: number
  questions: ExamQuestion[]
}

export interface ExamSectionPublic extends Omit<ExamSection, 'questions'> {
  questions: ExamQuestionPublic[]
}

export interface MockExam {
  id: string
  subjectId: string
  subjectName: string
  examBoard: string
  difficulty: ExamDifficulty
  sections: ExamSection[]
  totalMarks: number
  totalTimeMinutes: number
  createdBy?: string
  createdAt: string
  totalAttempts: number
}

export interface MockExamPublic extends Omit<MockExam, 'sections'> {
  sections: ExamSectionPublic[]
}

export interface TopicScore {
  topic: string
  score: number
  maxScore: number
  accuracy: number
}

export interface SectionScore {
  section: string
  score: number
  maxScore: number
  accuracy: number
}

export interface QuestionTiming {
  questionId: string
  questionNum: number
  timeSpent: number     // seconds
  marksAwarded: number
  efficiency: number    // marks per minute
}

export interface ExamAnalysis {
  overallScore: number
  maxScore: number
  percentage: number
  gradePrediction: IGCSEGrade
  gradeForImprovement: IGCSEGrade
  marksNeeded: number
  byTopic: TopicScore[]
  bySection: SectionScore[]
  timingAnalysis: QuestionTiming[]
  weakAreas: string[]
  strengths: string[]
  confidenceAccuracy: {
    markedForReview: { attempted: number; correct: number; accuracy: number }
    notMarked: { attempted: number; correct: number; accuracy: number }
  }
  nextSteps: string[]
  classComparison?: {
    yourScore: number
    classAverage: number
    percentile: number
    totalStudents: number
  }
}

export interface ExamAttempt {
  id: string
  userId: string
  examId: string
  answers: Record<string, string>
  timingData: Record<string, number>
  markedForReview: string[]
  score?: number
  maxScore?: number
  grade?: IGCSEGrade
  analysis?: ExamAnalysis
  startedAt: string
  completedAt?: string
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
