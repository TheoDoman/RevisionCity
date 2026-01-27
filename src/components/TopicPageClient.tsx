'use client';
import { getAllRevisionContent } from '@/lib/data';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Brain, HelpCircle, FileText, 
  Lightbulb, Network, ClipboardList, ChevronDown, Lock, Loader2
} from 'lucide-react';
import { cn, getSubjectColor } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  Flashcards, Quiz, NotesViewer, PracticeQuestions,
  ActiveRecall, SummarySheetViewer, MindMapViewer,
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
];

// Fallback mock data
const mockNote: Note = {
  id: '1', subtopic_id: '1', title: 'Introduction & Key Concepts',
  content: `## Overview\n\nThis topic introduces the fundamental concepts.\n\n## Key Definitions\n\n**Term 1**: The first important definition.\n\n**Term 2**: Another crucial concept.\n\n## Core Principles\n\n- First principle: Understanding the basic framework\n- Second principle: Applying knowledge\n- Third principle: Connecting concepts`,
  key_points: ['Understand basic definitions', 'Three core principles', 'Real-world examples help', 'Watch for misconceptions'],
  created_at: '',
};

const mockFlashcards: Flashcard[] = [
  { id: '1', subtopic_id: '1', front: 'What is Term 1?', back: 'The foundational concept.', difficulty: 'easy', created_at: '' },
  { id: '2', subtopic_id: '1', front: 'Name the three core principles', back: '1. Framework\n2. Application\n3. Connection', difficulty: 'medium', created_at: '' },
  { id: '3', subtopic_id: '1', front: 'Difference between Term 1 and Term 2?', back: 'Term 1 is foundational, Term 2 builds upon it.', difficulty: 'hard', created_at: '' },
];

const mockQuiz: QuizQuestion[] = [
  { id: '1', subtopic_id: '1', question: 'Which best describes the first principle?', question_type: 'multiple_choice', options: ['Memorizing', 'Understanding framework', 'Practice', 'Reading'], correct_answer: 'Understanding framework', explanation: 'The first principle emphasizes understanding.', difficulty: 'easy', created_at: '' },
  { id: '2', subtopic_id: '1', question: 'True or False: Term 2 needs Term 1.', question_type: 'true_false', options: ['True', 'False'], correct_answer: 'True', explanation: 'Term 2 builds on Term 1.', difficulty: 'easy', created_at: '' },
];

const mockPractice: PracticeQuestion[] = [
  { id: '1', subtopic_id: '1', question: 'Explain the relationship between Term 1 and Term 2.', marks: 4, mark_scheme: ['Definition of Term 1', 'Definition of Term 2', 'Relationship', 'Example'], example_answer: 'Term 1 is foundational. Term 2 builds upon it.', difficulty: 'foundation', created_at: '' },
];

const mockRecall: RecallPrompt[] = [
  { id: '1', subtopic_id: '1', prompt: 'Explain Term 1 in your own words.', hints: ['Think basics', 'Why first?'], model_answer: 'Term 1 is the foundation.', key_points_to_include: ['Definition', 'Foundation'], created_at: '' },
];

const mockSummary: SummarySheet = {
  id: '1', topic_id: '1', title: 'Summary',
  key_concepts: ['Term 1 is foundational', 'Term 2 builds on Term 1', 'Three core principles'],
  definitions: [{ term: 'Term 1', definition: 'Foundational concept' }],
  formulas: [{ name: 'Basic Formula', formula: 'A = B × C', usage: 'Calculate relationship' }],
  exam_tips: ['Define terms first', 'Use examples'],
  created_at: '',
};

const mockMindMap: MindMap = {
  id: '1', topic_id: '1', name: 'Key Concepts',
  root: {
    id: 'root', label: 'Key Concepts',
    children: [
      { id: 'term1', label: 'Term 1', children: [{ id: 't1d', label: 'Definition' }] },
      { id: 'term2', label: 'Term 2', children: [{ id: 't2d', label: 'Definition' }] },
      { id: 'principles', label: 'Principles', children: [{ id: 'p1', label: 'Framework' }, { id: 'p2', label: 'Application' }] },
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
}

export function TopicPageClient({ subject, topic, subtopics, initialContent }: TopicPageClientProps) {
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(subtopics[0]?.id || null);
  const [selectedMethod, setSelectedMethod] = useState('notes');
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const { subscriptionTier } = useAppStore();
  const color = getSubjectColor(subject.slug);
  const isLocked = (index: number) => subscriptionTier === 'free' && index >= 2;

  // Use real content if available, otherwise use mock
  console.log('TopicPageClient content:', {
    hasContent: !!content,
    notes: !!content?.notes,
    flashcards: content?.flashcards?.length || 0,
    quizQuestions: content?.quizQuestions?.length || 0,
    practiceQuestions: content?.practiceQuestions?.length || 0,
    recallPrompts: content?.recallPrompts?.length || 0,
  });

  const notes = content?.notes || mockNote;
  const flashcards = content?.flashcards?.length ? content.flashcards : mockFlashcards;
  const quizQuestions = content?.quizQuestions?.length ? content.quizQuestions : mockQuiz;
  const practiceQuestions = content?.practiceQuestions?.length ? content.practiceQuestions : mockPractice;
  const recallPrompts = content?.recallPrompts?.length ? content.recallPrompts : mockRecall;
  const mindMap = content?.mindMap || mockMindMap;
  const summarySheet = content?.summarySheet || mockSummary;
  const renderContent = () => {
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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      );
    }

    switch (selectedMethod) {
      case 'notes': return <NotesViewer note={notes} />;
      case 'flashcards': return <Flashcards flashcards={flashcards} />;
      case 'quiz': return <Quiz questions={quizQuestions} />;
      case 'practice': return <PracticeQuestions questions={practiceQuestions} />;
      case 'recall': return <ActiveRecall prompts={recallPrompts} />;
      case 'mindmap': return <MindMapViewer mindMap={mindMap} />;
      case 'summary': return <SummarySheetViewer summarySheet={summarySheet} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href={`/subject/${subject.slug}`} className="inline-flex items-center text-sm text-brand-600 hover:text-brand-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to {subject.name}
          </Link>
          <h1 className="font-display text-3xl font-bold text-brand-950 mb-2">{topic.name}</h1>
          <p className="text-brand-600">{subtopics.length} subtopics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subtopics */}
          <div className="lg:col-span-1">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Subtopics</h2>
            <div className="space-y-2">
              {subtopics.map((subtopic, index) => {
                const locked = isLocked(index);
                return (
                  <button
                    key={subtopic.id}
                    onClick={() => !locked && setSelectedSubtopic(subtopic.id)}
                    disabled={locked}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all',
                      selectedSubtopic === subtopic.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-brand-100 bg-white hover:border-brand-200',
                      locked && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                        selectedSubtopic === subtopic.id ? `bg-gradient-to-br ${color} text-white` : 'bg-brand-100 text-brand-600'
                      )}>
                        {locked ? <Lock className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-brand-800">{subtopic.name}</p>
                        {!locked && subtopic.description && (
                          <p className="text-xs text-brand-500 mt-0.5">{subtopic.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {subscriptionTier === 'free' && (
              <div className="mt-6 p-4 bg-gradient-to-br from-brand-100 to-accent-100 rounded-xl">
                <p className="text-sm font-medium text-brand-800 mb-2">Unlock all subtopics</p>
                <Link href="/pricing" className="btn-primary w-full py-2 text-sm text-center block">Upgrade</Link>
              </div>
            )}
          </div>
          {/* Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Revision Method</h2>
              <div className="flex flex-wrap gap-2">
                {revisionMethods.map((method) => (
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
                ))}
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
