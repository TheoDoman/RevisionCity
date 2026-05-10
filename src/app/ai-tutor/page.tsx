'use client';
import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AiTutor } from '@/components/revision/AiTutor';

interface Subject { id: string; name: string; slug: string; exam_board: string }
interface Topic   { id: string; name: string }

export default function AiTutorPage() {
  const [examBoard, setExamBoard] = useState<'cambridge' | 'edexcel'>('cambridge');
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [topics, setTopics]       = useState<Topic[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId]     = useState('');
  const [started, setStarted]     = useState(false);

  const selectedSubject = subjects.find(s => s.id === subjectId);
  const selectedTopic   = topics.find(t => t.id === topicId);

  // Load subjects when exam board changes
  useEffect(() => {
    setSubjectId('');
    setTopicId('');
    setTopics([]);
    setStarted(false);

    supabase
      .from('subjects')
      .select('id, name, slug, exam_board')
      .eq('exam_board', examBoard)
      .order('name')
      .then(({ data }) => setSubjects(data ?? []));
  }, [examBoard]);

  // Load topics when subject changes
  useEffect(() => {
    setTopicId('');
    setStarted(false);
    if (!subjectId) { setTopics([]); return; }

    supabase
      .from('topics')
      .select('id, name')
      .eq('subject_id', subjectId)
      .order('order_index')
      .then(({ data }) => setTopics(data ?? []));
  }, [subjectId]);

  const canStart = !!subjectId && !!topicId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-violet-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-950">AI Tutor</h1>
          </div>
          <p className="text-brand-600 text-sm">
            Ask anything — your tutor guides you to the answer through questions, not lectures.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!started ? (
          /* Setup panel */
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-8 max-w-lg mx-auto">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-6">
              What do you want to revise?
            </h2>

            {/* Exam board toggle */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-brand-600 mb-2 uppercase tracking-wide">
                Exam Board
              </label>
              <div className="flex gap-2">
                {(['cambridge', 'edexcel'] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => setExamBoard(b)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      examBoard === b
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-brand-100 text-brand-600 hover:border-brand-200'
                    }`}
                  >
                    {b === 'cambridge' ? 'Cambridge' : 'Edexcel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject dropdown */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-brand-600 mb-2 uppercase tracking-wide">
                Subject
              </label>
              <div className="relative">
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full appearance-none border-2 border-brand-100 rounded-xl px-4 py-2.5 text-sm text-brand-900 bg-white focus:outline-none focus:border-violet-400 transition-colors pr-10"
                >
                  <option value="">Select a subject…</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 pointer-events-none" />
              </div>
            </div>

            {/* Topic dropdown */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-brand-600 mb-2 uppercase tracking-wide">
                Topic
              </label>
              <div className="relative">
                <select
                  value={topicId}
                  onChange={e => setTopicId(e.target.value)}
                  disabled={!subjectId}
                  className="w-full appearance-none border-2 border-brand-100 rounded-xl px-4 py-2.5 text-sm text-brand-900 bg-white focus:outline-none focus:border-violet-400 transition-colors pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {subjectId ? 'Select a topic…' : 'Choose a subject first'}
                  </option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => setStarted(true)}
              disabled={!canStart}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Start Session
            </button>
          </div>
        ) : (
          /* Chat panel */
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-100">
              <div>
                <p className="text-sm font-semibold text-brand-900">
                  {selectedSubject?.name} · {selectedTopic?.name}
                </p>
                <p className="text-xs text-brand-500">
                  {examBoard === 'edexcel' ? 'Edexcel' : 'Cambridge'} IGCSE
                </p>
              </div>
              <button
                onClick={() => { setStarted(false); setTopicId(''); }}
                className="text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
              >
                Change topic
              </button>
            </div>

            <AiTutor
              subject={selectedSubject?.name ?? ''}
              topic={selectedTopic?.name ?? ''}
              examBoard={examBoard}
            />
          </div>
        )}
      </div>
    </div>
  );
}
