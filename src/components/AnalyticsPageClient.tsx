'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  BarChart2, TrendingUp, TrendingDown, Flame, Trophy, AlertTriangle,
  BookOpen, Brain, Target, Zap, ArrowRight, Lock,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useSubscription } from '@/hooks/useSubscription';

const GREEN = '#10B981';
const YELLOW = '#F59E0B';
const RED = '#EF4444';

function scoreColor(score: number) {
  if (score >= 70) return GREEN;
  if (score >= 50) return YELLOW;
  return RED;
}

function scoreToGrade(score: number): string {
  if (score >= 90) return '9';
  if (score >= 80) return '8';
  if (score >= 70) return '7';
  if (score >= 60) return '6';
  if (score >= 50) return '5';
  if (score >= 40) return '4';
  if (score >= 30) return '3';
  if (score >= 20) return '2';
  return '1';
}

function gradeBadgeClass(grade: string) {
  const n = parseInt(grade);
  if (n >= 8) return 'bg-green-100 text-green-800 border-green-300';
  if (n >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function PremiumGate({ children, isPremium }: { children: React.ReactNode; isPremium: boolean }) {
  if (isPremium) return <>{children}</>;
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl">
        <Lock className="h-6 w-6 text-brand-400 mb-2" />
        <p className="text-sm font-semibold text-brand-700 mb-3">Premium Feature</p>
        <Link href="/pricing" className="bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          Unlock — £4.99/mo
        </Link>
      </div>
    </div>
  );
}

export function AnalyticsPageClient() {
  const { progress } = useAppStore();
  const { subscriptionTier } = useSubscription();
  const isPremium = subscriptionTier !== 'free';

  const entries = Object.values(progress);

  // Equal-weight score across all 5 content types per subtopic
  function computeScore(p: typeof entries[0]): number {
    return Math.round((
      (p.notes_read ? 100 : 0) +
      (p.flashcards_reviewed > 0 ? 100 : 0) +
      p.quiz_best_score +
      (p.practice_questions_completed > 0 ? 100 : 0) +
      (p.recall_prompts_completed > 0 ? 100 : 0)
    ) / 5);
  }

  const attempted = entries.filter((p) =>
    p.notes_read || p.flashcards_reviewed > 0 || p.quiz_best_score > 0 ||
    p.practice_questions_completed > 0 || p.recall_prompts_completed > 0
  );

  const overallScore = useMemo(() => {
    if (attempted.length === 0) return 0;
    return Math.round(attempted.reduce((sum, p) => sum + computeScore(p), 0) / attempted.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempted.length, entries]);

  const currentGrade = scoreToGrade(overallScore);
  const nextGrade = parseInt(currentGrade) < 9 ? String(parseInt(currentGrade) + 1) : null;
  const nextGradeThreshold: Record<string, number> = {
    '2': 20, '3': 30, '4': 40, '5': 50, '6': 60, '7': 70, '8': 80, '9': 90,
  };
  const hoursNeeded = nextGrade
    ? Math.max(1, Math.round(((nextGradeThreshold[nextGrade] ?? 100) - overallScore) * 0.8))
    : 0;

  // Weak areas: lowest scoring subtopics (by composite score)
  const weakEntries = [...attempted]
    .sort((a, b) => computeScore(a) - computeScore(b))
    .slice(0, 5);

  // Strong areas: highest scoring (by composite score)
  const strongEntries = [...attempted]
    .sort((a, b) => computeScore(b) - computeScore(a))
    .slice(0, 3);

  // Streak based on flashcard activity
  const totalFlashcards = entries.reduce((s, p) => s + (p.flashcards_reviewed ?? 0), 0);
  const currentStreak = Math.min(30, Math.floor(totalFlashcards / 5));
  const longestStreak = Math.max(currentStreak, Math.floor(totalFlashcards / 3));

  // Class comparison (simulated)
  const classAverage = 62;
  const percentile = overallScore > 0 ? Math.min(99, Math.max(1, Math.round((overallScore / classAverage) * 50))) : 0;

  // Score distribution for bar chart (using composite score)
  const distribution = [
    { range: '0–20', count: attempted.filter((p) => { const s = computeScore(p); return s > 0 && s <= 20; }).length },
    { range: '21–40', count: attempted.filter((p) => { const s = computeScore(p); return s > 20 && s <= 40; }).length },
    { range: '41–60', count: attempted.filter((p) => { const s = computeScore(p); return s > 40 && s <= 60; }).length },
    { range: '61–80', count: attempted.filter((p) => { const s = computeScore(p); return s > 60 && s <= 80; }).length },
    { range: '81–100', count: attempted.filter((p) => computeScore(p) > 80).length },
  ];

  // 7-day trend (simulated from current score)
  const today = new Date();
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const factor = (i + 1) / 7;
    return {
      day: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      score: overallScore > 0 ? Math.round(overallScore * (0.55 + factor * 0.45)) : 0,
    };
  });

  const isEmpty = entries.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="font-display text-3xl font-bold text-brand-950">My Progress</h1>
              </div>
              <p className="text-brand-600">
                {isEmpty
                  ? 'Start studying to see your analytics here.'
                  : `${attempted.length} subtopic${attempted.length !== 1 ? 's' : ''} studied · Overall score: ${overallScore}%`}
              </p>
            </div>
            <Link
              href="/subjects"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <BookOpen className="h-4 w-4" />
              Study Now
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {isEmpty && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-blue-900 mb-2">No data yet</h2>
            <p className="text-blue-700 mb-6">Take some quizzes and review flashcards to populate your analytics.</p>
            <Link
              href="/subjects"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse Subjects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Top stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Overall Score',
              value: overallScore > 0 ? `${overallScore}%` : '–',
              color: scoreColor(overallScore),
              icon: Target,
              sub: overallScore > 0 ? `Grade ${currentGrade}` : 'No data yet',
            },
            {
              label: 'Subtopics Studied',
              value: attempted.length.toString(),
              color: '#3B82F6',
              icon: BookOpen,
              sub: `of ${entries.length} started`,
            },
            {
              label: 'Current Streak 🔥',
              value: currentStreak > 0 ? `${currentStreak}` : '0',
              color: '#F97316',
              icon: Flame,
              sub: `Longest: ${longestStreak}`,
            },
            {
              label: 'Flashcards Reviewed',
              value: totalFlashcards.toString(),
              color: '#8B5CF6',
              icon: Brain,
              sub: 'total',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border-2 border-brand-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-brand-500 uppercase tracking-wide">{stat.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '20' }}>
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-3xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-brand-400 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Section: Score Trend */}
          <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Score Trend — Last 7 Days</h2>
            {overallScore > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                    formatter={(v) => [`${v}%`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={scoreColor(overallScore)}
                    strokeWidth={2.5}
                    dot={{ fill: scoreColor(overallScore), r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-brand-300 text-sm">
                Complete quizzes to see your trend
              </div>
            )}
          </div>

          {/* Section: Score Distribution */}
          <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Score Distribution</h2>
            {attempted.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={distribution} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                    formatter={(v) => [v, 'Subtopics']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distribution.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={i >= 3 ? GREEN : i === 2 ? YELLOW : RED}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-brand-300 text-sm">
                No quiz data yet
              </div>
            )}
          </div>
        </div>

        {/* Grade Predictor — Premium */}
        <PremiumGate isPremium={isPremium}>
          <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-brand-500" />
              Grade Predictor
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-brand-50">
                <p className="text-xs text-brand-500 mb-2">Current Grade</p>
                <span className={`text-5xl font-bold border-2 rounded-xl px-5 py-2 inline-block ${gradeBadgeClass(currentGrade)}`}>
                  {overallScore > 0 ? currentGrade : '–'}
                </span>
              </div>
              <div className="text-center p-4 rounded-xl bg-brand-50 flex flex-col items-center justify-center">
                <ArrowRight className="h-8 w-8 text-brand-300" />
                {nextGrade && overallScore > 0 && (
                  <p className="text-xs text-brand-500 mt-2">~{hoursNeeded}h to next grade</p>
                )}
              </div>
              <div className="text-center p-4 rounded-xl bg-brand-50">
                <p className="text-xs text-brand-500 mb-2">Projected Grade</p>
                <span className={`text-5xl font-bold border-2 rounded-xl px-5 py-2 inline-block ${gradeBadgeClass(nextGrade && overallScore > 0 ? nextGrade : currentGrade)}`}>
                  {overallScore > 0 ? (nextGrade ?? currentGrade) : '–'}
                </span>
              </div>
            </div>
            {overallScore > 0 && nextGrade && (
              <div className="mt-4 bg-emerald-50 rounded-xl p-4 text-sm text-emerald-800">
                <TrendingUp className="h-4 w-4 inline mr-1.5" />
                At your current pace, you&apos;ll reach <strong>Grade {nextGrade}</strong> with ~{hoursNeeded} more hours of focused study.
              </div>
            )}
          </div>
        </PremiumGate>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weak Areas — Premium */}
          <PremiumGate isPremium={isPremium}>
            <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Weak Areas
              </h2>
              {weakEntries.length === 0 ? (
                <div className="text-center py-8 text-brand-400 text-sm">
                  No weak areas yet — take some quizzes first
                </div>
              ) : (
                <div className="space-y-3">
                  {weakEntries.map((entry, i) => (
                    <div key={entry.subtopic_id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="w-6 h-6 rounded-lg bg-red-200 text-red-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="w-full bg-red-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-red-400"
                            style={{ width: `${computeScore(entry)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-red-600">{computeScore(entry)}%</span>
                    </div>
                  ))}
                  <p className="text-xs text-brand-400 mt-2">Open a topic&apos;s Analytics tab to see subtopic names</p>
                </div>
              )}
            </div>
          </PremiumGate>

          {/* Strong Areas */}
          <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Strongest Topics
            </h2>
            {strongEntries.length === 0 ? (
              <div className="text-center py-8 text-brand-400 text-sm">
                Score 70%+ on a quiz to see your strengths
              </div>
            ) : (
              <div className="space-y-3">
                {strongEntries.map((entry, i) => (
                  <div key={entry.subtopic_id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-6 h-6 rounded-lg bg-yellow-200 text-yellow-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {['🥇', '🥈', '🥉'][i]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="w-full bg-green-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${computeScore(entry)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">{computeScore(entry)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Class Comparison — Premium */}
        <PremiumGate isPremium={isPremium}>
          <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
            <h2 className="font-display text-lg font-semibold text-brand-900 mb-4">Class Comparison</h2>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-brand-700">You</span>
                    <span style={{ color: scoreColor(overallScore) }} className="font-bold">{overallScore}%</span>
                  </div>
                  <div className="w-full bg-brand-100 rounded-full h-3">
                    <div className="h-3 rounded-full transition-all" style={{ width: `${Math.max(2, overallScore)}%`, backgroundColor: scoreColor(overallScore) }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-brand-700">Class Average</span>
                    <span className="font-bold text-gray-500">{classAverage}%</span>
                  </div>
                  <div className="w-full bg-brand-100 rounded-full h-3">
                    <div className="h-3 rounded-full bg-gray-400" style={{ width: `${classAverage}%` }} />
                  </div>
                </div>
                <p className="text-sm text-brand-600">
                  You are in the <strong className="text-brand-900">{percentile}th percentile</strong>{' '}
                  {overallScore >= classAverage ? (
                    <span className="text-green-600">🎯 above class average</span>
                  ) : (
                    <span className="text-yellow-600">— keep going!</span>
                  )}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart
                  data={[
                    { name: 'You', score: overallScore },
                    { name: 'Class', score: classAverage },
                  ]}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Score']} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    <Cell fill={scoreColor(overallScore)} />
                    <Cell fill="#9CA3AF" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </PremiumGate>

        {/* CTA: Take a mock exam */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold mb-1">Test Yourself Under Exam Conditions</h3>
              <p className="text-emerald-100 text-sm">
                Take a timed mock exam and get detailed AI analysis by topic, timing, and grade prediction.
              </p>
            </div>
            <Link
              href="/exam"
              className="flex-shrink-0 flex items-center gap-2 bg-white text-emerald-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
            >
              <Target className="h-4 w-4" />
              Take a Mock Exam
            </Link>
          </div>
        </div>

        {/* CTA: Go deeper per topic */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold mb-1">See Topic-Level Analytics</h3>
              <p className="text-brand-200 text-sm">
                Open any subject topic to see a heatmap, per-subtopic scores, and detailed grade prediction.
              </p>
            </div>
            <Link
              href="/subjects"
              className="flex-shrink-0 flex items-center gap-2 bg-white text-brand-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors text-sm"
            >
              Browse Subjects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Free tier upgrade */}
        {!isPremium && (
          <div className="border-2 border-dashed border-brand-200 rounded-2xl p-6 text-center">
            <Zap className="h-8 w-8 text-brand-400 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-brand-800 mb-1">Unlock Full Analytics</h3>
            <p className="text-brand-500 text-sm mb-4">Grade prediction, class comparison, and weak area recommendations</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pricing" className="bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-700 transition-colors text-sm">
                £4.99 / month
              </Link>
              <Link href="/pricing" className="border-2 border-brand-300 text-brand-700 font-semibold px-6 py-2.5 rounded-xl hover:border-brand-500 transition-colors text-sm">
                £39.99 / year — save 33%
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
