'use client';
import { getAllRevisionContent } from '@/lib/data';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, Brain, HelpCircle, FileText,
  Lightbulb, Network, ClipboardList, Loader2, Sparkles, BarChart2, Calendar
} from 'lucide-react';
import { cn, getSubjectColor } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  trackViewTopic, trackViewNote, trackEvent,
} from '@/lib/analytics';
import {
  Flashcards, Quiz, NotesViewer, PracticeQuestions,
  ActiveRecall, SummarySheetViewer, MindMapViewer, AiTutor, AnalyticsDashboard,
} from '@/components/revision';
import type {
  Subject, Topic, Subtopic, Note, Flashcard, QuizQuestion,
  PracticeQuestion, RecallPrompt, MindMap, SummarySheet
} from '@/types';

const revisionMethods = [
  { id: 'notes', name: 'Notes', icon: BookOpen },
  { id: 'flashcards', name: 'Flashcards', icon: Brain },
  { id: 'quiz', name: 'Quiz', icon: HelpCircle },
  { id: 'practice', name: 'Practice', icon: FileText },
  { id: 'recall', name: 'Recall', icon: Lightbulb },
  { id: 'mindmap', name: 'Mind Map', icon: Network },
  { id: 'summary', name: 'Summary', icon: ClipboardList },
  { id: 'tutor', name: 'AI Tutor', icon: Sparkles },
  { id: 'analytics', name: 'Analytics', icon: BarChart2 },
  { id: 'plan', name: 'Study Plan', icon: Calendar, isLink: true },
];

// Fallback mock data
const mockNote: Note = {
  id: '1', subtopic_id: '1', title: 'Introduction & Key Concepts',
  content: `## Overview\n\nThis topic introduces the fundamental concepts you need to master for your IGCSE exams.\n\n## Key Definitions\n\n**Variable**: A quantity that can change or vary in value.\n\n**Constant**: A fixed value that does not change.\n\n## Core Principles\n\n- First principle: Understanding the basic framework and definitions\n- Second principle: Applying knowledge to solve problems\n- Third principle: Connecting concepts across topics`,
  key_points: ['Understand basic definitions', 'Master three core principles', 'Use real-world examples', 'Watch for common misconceptions'],
  created_at: '',
};

const mockFlashcards: Flashcard[] = [
  { id: '1', subtopic_id: '1', front: 'What is a variable?', back: 'A quantity that can change or vary in value.', difficulty: 'easy', created_at: '' },
  { id: '2', subtopic_id: '1', front: 'Name the three core principles of this topic', back: '1. Understanding framework\n2. Applying knowledge\n3. Connecting concepts', difficulty: 'medium', created_at: '' },
  { id: '3', subtopic_id: '1', front: 'What is the difference between a variable and a constant?', back: 'A variable can change, while a constant stays fixed.', difficulty: 'hard', created_at: '' },
];

const mockQuiz: QuizQuestion[] = [
  { id: '1', subtopic_id: '1', question: 'Which best describes the first core principle?', question_type: 'multiple_choice', options: ['Memorizing facts', 'Understanding the framework', 'Practicing problems', 'Reading textbooks'], correct_answer: 'Understanding the framework', explanation: 'The first principle emphasizes building a strong foundation through understanding.', difficulty: 'easy', created_at: '' },
  { id: '2', subtopic_id: '1', question: 'True or False: Constants can change their value.', question_type: 'true_false', options: ['True', 'False'], correct_answer: 'False', explanation: 'Constants are fixed values that do not change.', difficulty: 'easy', created_at: '' },
];

const mockPractice: PracticeQuestion[] = [
  { id: '1', subtopic_id: '1', question: 'Explain the relationship between variables and constants in mathematical expressions.', marks: 4, mark_scheme: ['Definition of variable', 'Definition of constant', 'How they work together', 'Example provided'], example_answer: 'Variables are quantities that can change, while constants are fixed. In expressions, constants provide stable reference points while variables allow us to represent changing quantities.', difficulty: 'foundation', created_at: '' },
];

const mockRecall: RecallPrompt[] = [
  { id: '1', subtopic_id: '1', prompt: 'Explain what a variable is and give an example.', hints: ['Think about quantities that change', 'Use real-world examples'], model_answer: 'A variable is a quantity that can change or take different values. For example, temperature throughout a day is a variable.', key_points_to_include: ['Definition of variable', 'Can change value', 'Real example'], created_at: '' },
];

const mockSummary: SummarySheet = {
  id: '1', topic_id: '1', title: 'Topic Summary',
  key_concepts: ['Variables represent changing quantities', 'Constants are fixed values', 'Apply three core principles for mastery'],
  definitions: [{ term: 'Variable', definition: 'A quantity that can change or vary in value' }, { term: 'Constant', definition: 'A fixed value that does not change' }],
  formulas: [{ name: 'Basic Expression', formula: 'y = mx + c', usage: 'Where m and c are constants, x is the variable' }],
  exam_tips: ['Always define your terms clearly', 'Use examples to illustrate concepts', 'Show your working step by step'],
  created_at: '',
};

const mockMindMap: MindMap = {
  id: '1', topic_id: '1', name: 'Key Concepts',
  root: {
    id: 'root', label: 'Key Concepts',
    children: [
      { id: 'variables', label: 'Variables', children: [{ id: 'v1', label: 'Can change' }, { id: 'v2', label: 'Represented by letters' }] },
      { id: 'constants', label: 'Constants', children: [{ id: 'c1', label: 'Fixed values' }, { id: 'c2', label: 'Do not change' }] },
      { id: 'principles', label: 'Core Principles', children: [{ id: 'p1', label: 'Understand' }, { id: 'p2', label: 'Apply' }, { id: 'p3', label: 'Connect' }] },
    ],
  },
  created_at: '',
};

interface TopicPageClientProps {
  subject: Subject;
  topic: Topic;
  subtopics: Subtopic[];
  initialContent: {
    notes: Note | null;
    flashcards: Flashcard[];
    quizQuestions: QuizQuestion[];
    practiceQuestions: PracticeQuestion[];
    recallPrompts: RecallPrompt[];
    mindMap: MindMap | null;
    summarySheet: SummarySheet | null;
  } | null;
  board?: 'cambridge' | 'edexcel';
}

export function TopicPageClient({ subject, topic, subtopics, initialContent, board }: TopicPageClientProps) {
  const resolvedBoard = board ?? (subject.slug.endsWith('-edexcel') ? 'edexcel' : 'cambridge');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(subtopics[0]?.id || null);
  const [selectedMethod, setSelectedMethod] = useState('notes');
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const { updateProgress, progress } = useAppStore();
  const color = getSubjectColor(subject.slug);

  // Track which subtopics have had notes marked as read (avoid double-writes)
  const notesReadRef = useRef<Set<string>>(new Set());

  // Fire-and-forget Supabase activity log (for dashboard page)
  const logActivity = useCallback((
    activityType: 'note' | 'flashcard' | 'quiz' | 'practice' | 'recall',
    score?: number,
  ) => {
    if (!selectedSubtopic) return;
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_type: activityType,
        subject_id: subject.id,
        topic_id: topic.id,
        subtopic_id: selectedSubtopic,
        score,
      }),
    }).catch(() => {/* ignore — analytics should never break the study flow */});
  }, [selectedSubtopic, subject.id, topic.id]);

  // Track topic view on mount
  useEffect(() => {
    trackViewTopic(topic.name, subject.name);
  }, [topic.name, subject.name]);

  // Track subtopic/note views when subtopic changes
  useEffect(() => {
    if (!selectedSubtopic) return;
    const subtopic = subtopics.find(s => s.id === selectedSubtopic);
    if (subtopic) {
      trackViewNote(subtopic.name, topic.name, subject.name);
    }
  }, [selectedSubtopic, subtopics, topic.name, subject.name]);

  // Track revision method switches
  useEffect(() => {
    trackEvent('switch_revision_method', {
      method: selectedMethod,
      topic_name: topic.name,
      subject_name: subject.name,
    });
  }, [selectedMethod, topic.name, subject.name]);

  // Use real content if available, otherwise use mock
  console.log('TopicPageClient content:', {
    hasContent: !!content,
    notes: !!content?.notes,
    flashcards: content?.flashcards?.length || 0,
    quizQuestions: content?.quizQuestions?.length || 0,
    practiceQuestions: content?.practiceQuestions?.length || 0,
    recallPrompts: content?.recallPrompts?.length || 0,
  });

  const notes = content?.notes || null;
  const flashcards = content?.flashcards?.length ? content.flashcards : [];
  const quizQuestions = content?.quizQuestions?.length ? content.quizQuestions : [];
  const practiceQuestions = content?.practiceQuestions?.length ? content.practiceQuestions : [];
  const recallPrompts = content?.recallPrompts?.length ? content.recallPrompts : [];
  const mindMap = content?.mindMap || null;
  const summarySheet = content?.summarySheet || null;

  // Mark notes as read when user views the notes tab (once per subtopic)
  useEffect(() => {
    if (selectedMethod !== 'notes' || !notes || !selectedSubtopic) return;
    if (notesReadRef.current.has(selectedSubtopic)) return;
    notesReadRef.current.add(selectedSubtopic);
    updateProgress(selectedSubtopic, { notes_read: true });
    logActivity('note');
  }, [selectedMethod, notes, selectedSubtopic, updateProgress, logActivity]);

  // Fetch content when subtopic changes
  useEffect(() => {
    if (!selectedSubtopic) return;

    const fetchContent = async () => {
      setLoading(true);
      try {
        const newContent = await getAllRevisionContent(selectedSubtopic, topic.id);
        setContent(newContent);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedSubtopic, topic.id]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      );
    }

    switch (selectedMethod) {
      case 'notes':
        return notes ? <NotesViewer note={notes} /> : <div className="text-center py-12 text-brand-500">Notes not yet available for this topic. Check back soon!</div>;
      case 'flashcards':
        return flashcards.length > 0 ? (
          <Flashcards
            flashcards={flashcards}
            onComplete={({ correct, incorrect }) => {
              if (!selectedSubtopic) return;
              const reviewed = correct + incorrect;
              updateProgress(selectedSubtopic, { flashcards_reviewed: reviewed });
              logActivity('flashcard');
            }}
          />
        ) : <div className="text-center py-12 text-brand-500">Flashcards not yet available for this topic. Check back soon!</div>;
      case 'quiz':
        return quizQuestions.length > 0 ? (
          <Quiz
            questions={quizQuestions}
            onComplete={(score, total) => {
              if (!selectedSubtopic) return;
              const pct = Math.round((score / total) * 100);
              // Only update if it's a new best score
              const currentBest = progress[selectedSubtopic]?.quiz_best_score ?? 0;
              if (pct > currentBest) {
                updateProgress(selectedSubtopic, { quiz_best_score: pct });
              }
              logActivity('quiz', pct);
            }}
          />
        ) : <div className="text-center py-12 text-brand-500">Quiz questions not yet available for this topic. Check back soon!</div>;
      case 'practice':
        return practiceQuestions.length > 0 ? (
          <PracticeQuestions
            questions={practiceQuestions}
            onComplete={(completed) => {
              if (!selectedSubtopic) return;
              updateProgress(selectedSubtopic, { practice_questions_completed: completed });
              logActivity('practice');
            }}
          />
        ) : <div className="text-center py-12 text-brand-500">Practice questions not yet available for this topic. Check back soon!</div>;
      case 'recall':
        return recallPrompts.length > 0 ? (
          <ActiveRecall
            prompts={recallPrompts}
            onComplete={(completed) => {
              if (!selectedSubtopic) return;
              updateProgress(selectedSubtopic, { recall_prompts_completed: completed });
              logActivity('recall');
            }}
          />
        ) : <div className="text-center py-12 text-brand-500">Recall prompts not yet available for this topic. Check back soon!</div>;
      case 'mindmap':
        return mindMap ? <MindMapViewer mindMap={mindMap} /> : <div className="text-center py-12 text-brand-500">Mind map not yet available for this topic. Check back soon!</div>;
      case 'summary':
        return summarySheet ? <SummarySheetViewer summarySheet={summarySheet} /> : <div className="text-center py-12 text-brand-500">Summary sheet not yet available for this topic. Check back soon!</div>;
      case 'tutor':
        return (
          <AiTutor
            subject={subject.name}
            topic={topic.name}
            examBoard={resolvedBoard}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard
            subject={subject}
            topic={topic}
            subtopics={subtopics}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/subject/${resolvedBoard}/${subject.slug.replace(/-edexcel$/, '')}`}
            className="inline-flex items-center text-sm hover:opacity-80 mb-4"
            style={{ color: resolvedBoard === 'edexcel' ? '#6A0DAD' : '#003865' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />Back to {subject.name}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-3xl font-bold text-brand-950">{topic.name}</h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: resolvedBoard === 'edexcel' ? '#6A0DAD' : '#003865' }}
            >
              {resolvedBoard === 'edexcel' ? 'Edexcel' : 'Cambridge'}
            </span>
          </div>
          <p className="text-brand-600">{subtopics.length} subtopics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subtopics */}
          <div className="lg:col-span-1">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Subtopics</h2>
            <div className="space-y-2">
              {subtopics.map((subtopic, index) => (
                <button
                  key={subtopic.id}
                  onClick={() => setSelectedSubtopic(subtopic.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                    selectedSubtopic === subtopic.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-brand-100 bg-white hover:border-brand-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                      selectedSubtopic === subtopic.id ? `bg-gradient-to-br ${color} text-white` : 'bg-brand-100 text-brand-600'
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-brand-800">{subtopic.name}</p>
                      {subtopic.description && (
                        <p className="text-xs text-brand-500 mt-0.5">{subtopic.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Revision Method</h2>
              <div className="flex flex-wrap gap-2">
                {revisionMethods.map((method) =>
                  (method as { isLink?: boolean }).isLink ? (
                    <Link
                      key={method.id}
                      href={`/subject/${subject.slug}#revision-plan`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white border-2 border-violet-200 text-violet-700 hover:bg-violet-50"
                    >
                      <method.icon className="h-4 w-4" />{method.name}
                    </Link>
                  ) : (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        selectedMethod === method.id
                          ? `bg-gradient-to-r ${color} text-white shadow-lg`
                          : 'bg-white border-2 border-brand-100 text-brand-700 hover:border-brand-200'
                      )}
                    >
                      <method.icon className="h-4 w-4" />{method.name}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-brand-100 p-6 min-h-[500px]">
              {selectedSubtopic ? (
                <div className="animate-fade-in">{renderContent()}</div>
              ) : (
                <div className="flex items-center justify-center h-full text-brand-500">
                  Select a subtopic to start
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
