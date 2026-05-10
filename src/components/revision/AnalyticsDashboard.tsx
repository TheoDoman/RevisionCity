'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Share2, Flame, Trophy, Target, AlertTriangle, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Subject, Topic, Subtopic } from '@/types';

interface AnalyticsData {
  overallScore: number;
  topicBreakdown: {
    subtopicId: string;
    topic: string;
    avg: number;
    attempts: number;
    trend: 'up' | 'stable' | 'down';
  }[];
  gradePredictor: {
    currentGrade: string;
    projectedGrade: string;
    hoursNeeded: number;
    weakAreas: string[];
    momentum: 'improving' | 'declining';
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
    quizzesToday: number;
  };
  compareToClass: {
    yourScore: number;
    classAverage: number;
    percentile: number;
  };
  trendData: { day: string; score: number }[];
  subtopicCount: number;
  attemptedCount: number;
}

interface Props {
  subject: Subject;
  topic: Topic;
  subtopics: Subtopic[];
}

const GREEN = '#10B981';
const YELLOW = '#F59E0B';
const RED = '#EF4444';
const BLUE = '#3B82F6';

function scoreColor(score: number) {
  if (score >= 70) return GREEN;
  if (score >= 50) return YELLOW;
  return RED;
}

function scoreLabel(score: number) {
  if (score >= 70) return 'strong';
  if (score >= 50) return 'medium';
  if (score > 0) return 'weak';
  return 'not attempted';
}

function gradeBadge(grade: string) {
  const num = parseInt(grade);
  if (num >= 8) return 'bg-green-100 text-green-800 border-green-300';
  if (num >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function TrendIcon({ trend }: { trend: 'up' | 'stable' | 'down' }) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-yellow-500" />;
}

export function AnalyticsDashboard({ subject, topic, subtopics }: Props) {
  const { progress } = useAppStore();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalBests, setPersonalBests] = useState<Record<string, boolean>>({});

  // Build the progress subset for this topic's subtopics
  const topicProgress = useMemo(() => {
    const ids = new Set(subtopics.map((s) => s.id));
    return Object.fromEntries(
      Object.entries(progress).filter(([id]) => ids.has(id))
    );
  }, [progress, subtopics]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const progressParam = encodeURIComponent(JSON.stringify(topicProgress));
        const res = await fetch(
          `/api/analytics?topicId=${topic.id}&subjectId=${subject.id}&progress=${progressParam}`
        );
        if (!res.ok) throw new Error('Analytics fetch failed');
        const json = await res.json();
        setData(json);

        // Detect personal bests (score === 100)
        const bests: Record<string, boolean> = {};
        json.topicBreakdown.forEach((t: AnalyticsData['topicBreakdown'][0]) => {
          if (t.avg === 100) bests[t.subtopicId] = true;
        });
        setPersonalBests(bests);
      } catch (e) {
        console.error('Analytics error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [topic.id, subject.id, topicProgress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-brand-600 text-sm">Crunching your data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-brand-500">
        Could not load analytics. Try again later.
      </div>
    );
  }

  const hasActivity = data.attemptedCount > 0;
  const nextGradeNum = parseInt(data.gradePredictor.currentGrade) + 1;
  const nextGrade = nextGradeNum <= 9 ? String(nextGradeNum) : null;

  const handleShare = () => {
    const text = `I'm in the ${data.compareToClass.percentile}th percentile studying ${subject.name} on RevisionCity! 📊`;
    if (navigator.share) {
      navigator.share({ text, title: 'RevisionCity Progress', url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-900">
            Your Progress in {topic.name}
          </h2>
          <p className="text-brand-500 text-sm mt-1">
            {data.attemptedCount} of {data.subtopicCount} subtopics attempted
          </p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-brand-200 text-brand-700 hover:border-brand-400 text-sm font-medium transition-all"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {!hasActivity && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <strong>No quiz data yet.</strong> Take a quiz or review flashcards to populate your analytics.
        </div>
      )}

      {/* Section 1: Overall Score */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wide mb-4">Overall Score</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="text-6xl font-bold tabular-nums"
              style={{ color: scoreColor(data.overallScore) }}
            >
              {data.overallScore}
              <span className="text-2xl text-brand-400">%</span>
            </div>
            {data.gradePredictor.momentum === 'improving' ? (
              <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                <TrendingUp className="h-4 w-4" /> Improving
              </div>
            ) : data.overallScore > 0 ? (
              <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                <TrendingDown className="h-4 w-4" /> Losing momentum
              </div>
            ) : null}
          </div>
          <div className="flex-1">
            <div className="w-full bg-brand-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(2, data.overallScore)}%`,
                  backgroundColor: scoreColor(data.overallScore),
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-brand-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            {nextGrade && data.gradePredictor.hoursNeeded > 0 && (
              <p className="text-xs text-brand-600 mt-2">
                {data.gradePredictor.hoursNeeded} more hours of study could reach Grade {nextGrade}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Topic Heatmap */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wide mb-4">Topic Heatmap</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {data.topicBreakdown.map((t) => {
            const color = t.avg > 0 ? scoreColor(t.avg) : '#E5E7EB';
            const label = scoreLabel(t.avg);
            const isPB = personalBests[t.subtopicId];
            return (
              <div
                key={t.subtopicId}
                className="relative rounded-xl p-3 text-center transition-transform hover:scale-105"
                style={{ backgroundColor: color + '20', borderWidth: 2, borderColor: color }}
                title={`${t.topic}: ${t.avg}% (${label})`}
              >
                {isPB && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-0.5">
                    <Trophy className="h-3 w-3 text-white" />
                  </div>
                )}
                {t.avg > 0 && t.trend === 'down' && (
                  <div className="absolute -top-2 -left-2 bg-red-400 rounded-full p-0.5" title="Weak Area Alert">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="font-bold text-lg" style={{ color }}>
                  {t.avg > 0 ? `${t.avg}%` : '–'}
                </div>
                <div className="text-xs text-brand-600 mt-1 leading-tight line-clamp-2">
                  {t.topic}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendIcon trend={t.trend} />
                  <span className="text-xs" style={{ color }}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-brand-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-200 border border-green-500 inline-block" /> Strong ≥70%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-200 border border-yellow-500 inline-block" /> Medium 50–70%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-200 border border-red-500 inline-block" /> Weak &lt;50%</span>
        </div>
      </div>

      {/* Section 3: Score Trend (7 days) */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wide mb-4">Score Trend — Last 7 Days</h3>
        {hasActivity ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v) => [`${v}%`, 'Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={scoreColor(data.overallScore)}
                strokeWidth={2.5}
                dot={{ fill: scoreColor(data.overallScore), r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-32 text-brand-400 text-sm">
            Complete quizzes to see your trend
          </div>
        )}
      </div>

      {/* Section 4: Grade Predictor */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
          <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wide mb-4">
            <Target className="h-4 w-4 inline mr-1" />
            Grade Predictor
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 rounded-xl bg-brand-50">
              <p className="text-xs text-brand-500 mb-1">Current Grade</p>
              <span
                className={`text-4xl font-bold border-2 rounded-xl px-4 py-2 inline-block ${gradeBadge(data.gradePredictor.currentGrade)}`}
              >
                {data.overallScore > 0 ? data.gradePredictor.currentGrade : '–'}
              </span>
            </div>
            <div className="text-center p-4 rounded-xl bg-brand-50">
              <p className="text-xs text-brand-500 mb-1">Projected Grade</p>
              <span
                className={`text-4xl font-bold border-2 rounded-xl px-4 py-2 inline-block ${gradeBadge(data.gradePredictor.projectedGrade)}`}
              >
                {data.overallScore > 0 ? data.gradePredictor.projectedGrade : '–'}
              </span>
            </div>
          </div>
          {data.overallScore > 0 && nextGrade && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">
                  At current pace, you&apos;ll achieve Grade {data.gradePredictor.projectedGrade}.
                </p>
              </div>
              {data.gradePredictor.hoursNeeded > 0 && (
                <>
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (data.overallScore / 90) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-700">
                    You need ~{data.gradePredictor.hoursNeeded} more study hours
                    {data.gradePredictor.weakAreas.length > 0
                      ? ` focusing on: ${data.gradePredictor.weakAreas.slice(0, 2).join(', ')}`
                      : ''}{' '}
                    to reach Grade {nextGrade}.
                  </p>
                </>
              )}
            </div>
          )}
      </div>

      {/* Section 5: Study Streak */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wide mb-4">
          🔥 Study Streak
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-3xl font-bold text-orange-600">{data.streaks.currentStreak}</span>
            </div>
            <p className="text-xs text-orange-600 mt-1">Current Streak</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{data.streaks.longestStreak}</div>
            <p className="text-xs text-purple-600 mt-1">Longest Streak</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">{data.streaks.quizzesToday}</div>
            <p className="text-xs text-green-600 mt-1">Quizzes Today</p>
          </div>
        </div>
        {data.streaks.currentStreak >= 5 && (
          <div className="mt-3 text-center text-sm text-orange-600 font-medium">
            🔥 You&apos;re on fire! Keep it up!
          </div>
        )}
      </div>

      {/* Section 6: Class Comparison */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
          <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wide mb-4">Class Comparison</h3>
          <div className="flex items-end gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-brand-500 mb-1">
                <span>You</span>
                <span style={{ color: scoreColor(data.compareToClass.yourScore) }}>
                  {data.compareToClass.yourScore}%
                </span>
              </div>
              <div className="w-full bg-brand-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${Math.max(2, data.compareToClass.yourScore)}%`,
                    backgroundColor: scoreColor(data.compareToClass.yourScore),
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-brand-500 mb-1">
                <span>Class Average</span>
                <span>{data.compareToClass.classAverage}%</span>
              </div>
              <div className="w-full bg-brand-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gray-400"
                  style={{ width: `${Math.max(2, data.compareToClass.classAverage)}%` }}
                />
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={[
                { name: 'You', score: data.compareToClass.yourScore },
                { name: 'Class Avg', score: data.compareToClass.classAverage },
              ]}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v) => [`${v}%`, 'Score']}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                <Cell fill={scoreColor(data.compareToClass.yourScore)} />
                <Cell fill="#9CA3AF" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 text-center">
            <span className="text-lg font-bold text-brand-800">{data.compareToClass.percentile}th percentile</span>
            <span className="text-brand-500 text-sm ml-2">
              {data.compareToClass.yourScore >= data.compareToClass.classAverage
                ? '🎯 Above class average!'
                : 'Keep going to beat the average!'}
            </span>
          </div>
          <button
            onClick={handleShare}
            className="mt-3 w-full text-center text-xs text-brand-400 hover:text-brand-600 transition-colors"
          >
            Share: &ldquo;I&apos;m in the {data.compareToClass.percentile}th percentile! 📊&rdquo;
          </button>
      </div>

      {/* Section 7: Weak Areas */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
          <h3 className="text-sm font-semibold text-brand-500 uppercase tracking-wide mb-4">
            <AlertTriangle className="h-4 w-4 inline mr-1 text-red-400" />
            Weak Areas — Focus Here First
          </h3>
          {data.gradePredictor.weakAreas.length === 0 ? (
            <div className="text-center py-6 text-green-600">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              {data.attemptedCount === 0
                ? 'Complete quizzes to identify weak areas'
                : '✅ No weak areas! Keep up the great work.'}
            </div>
          ) : (
            <div className="space-y-3">
              {data.gradePredictor.weakAreas.map((area, i) => {
                const t = data.topicBreakdown.find((x) => x.topic === area);
                return (
                  <div key={area} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                    <div className="w-7 h-7 rounded-lg bg-red-200 text-red-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{area}</p>
                      {t && (
                        <p className="text-xs text-red-500">
                          Current score: {t.avg}% — needs{' '}
                          {t.avg < 50 ? '+' + (60 - t.avg) : '+' + (70 - t.avg)} points to reach{' '}
                          {t.avg < 50 ? 'medium' : 'strong'}
                        </p>
                      )}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: scoreColor(t?.avg ?? 0) }}
                    >
                      {t?.avg ?? 0}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

    </div>
  );
}
