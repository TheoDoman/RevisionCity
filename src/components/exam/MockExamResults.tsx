'use client'

import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell,
} from 'recharts'
import {
  Trophy, Target, TrendingUp, Clock, Brain, AlertTriangle,
  CheckCircle2, ArrowRight, Users, BarChart2, Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExamAnalysis } from '@/types'

interface Props {
  analysis: ExamAnalysis
  examId: string
  subjectName: string
  examBoard: string
}

const GRADE_COLORS: Record<string, string> = {
  'A*': '#7C3AED', A: '#2563EB', B: '#059669', C: '#D97706',
  D: '#EA580C', E: '#DC2626', F: '#9CA3AF', G: '#6B7280', U: '#374151',
}

function scoreColor(acc: number): string {
  if (acc >= 70) return '#10B981'
  if (acc >= 50) return '#F59E0B'
  return '#EF4444'
}

export function MockExamResults({ analysis, examId, subjectName, examBoard }: Props) {
  const { overallScore, maxScore, percentage, gradePrediction, gradeForImprovement,
    marksNeeded, byTopic, bySection, timingAnalysis, weakAreas, strengths,
    confidenceAccuracy, nextSteps, classComparison } = analysis

  // Timing chart — efficiency per question
  const avgEfficiency =
    timingAnalysis.length > 0
      ? timingAnalysis.reduce((a, b) => a + b.efficiency, 0) / timingAnalysis.length
      : 0

  const timingChartData = timingAnalysis.map((t) => ({
    name: `Q${t.questionNum}`,
    efficiency: t.efficiency,
    time: Math.round(t.timeSpent / 60 * 10) / 10, // minutes
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-950">
            {subjectName} Mock Exam — Results
          </h1>
          <p className="text-brand-500 text-sm mt-1">
            {examBoard.charAt(0).toUpperCase() + examBoard.slice(1)} IGCSE
          </p>
        </div>
        <Link
          href={`/exam?retake=${examId}`}
          className="flex items-center gap-2 btn-primary px-5 py-2.5 text-sm"
        >
          <ArrowRight className="h-4 w-4" />
          Retake Exam
        </Link>
      </div>

      {/* ── Card 1: Overall score ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1 flex flex-col items-center justify-center py-4">
            <div
              className="text-6xl font-bold mb-1"
              style={{ color: GRADE_COLORS[gradePrediction] ?? '#374151' }}
            >
              {overallScore}
            </div>
            <div className="text-brand-400 text-sm">out of {maxScore}</div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-2xl font-bold px-3 py-1 rounded-lg text-white"
                style={{ background: GRADE_COLORS[gradePrediction] ?? '#374151' }}
              >
                Grade {gradePrediction}
              </span>
              <span className="text-brand-500 text-sm">{percentage}%</span>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-4">
            {/* Score bar */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-brand-600">Your score</span>
                <span className="font-semibold text-brand-900">{percentage}%</span>
              </div>
              <div className="h-3 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${percentage}%`, background: GRADE_COLORS[gradePrediction] ?? '#374151' }}
                />
              </div>
            </div>

            {marksNeeded > 0 && (
              <div className="p-3 bg-brand-50 rounded-xl text-sm text-brand-700">
                <Target className="h-4 w-4 inline mr-2 text-brand-500" />
                You need <strong>{marksNeeded} more marks</strong> to reach{' '}
                <span className="font-bold" style={{ color: GRADE_COLORS[gradeForImprovement] }}>
                  Grade {gradeForImprovement}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {strengths.length > 0 && (
                <div className="p-3 bg-green-50 rounded-xl text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mb-1" />
                  <p className="font-medium text-green-800 text-xs uppercase tracking-wide mb-1">Strong</p>
                  <p className="text-green-700">{strengths.slice(0, 2).join(', ')}</p>
                </div>
              )}
              {weakAreas.length > 0 && (
                <div className="p-3 bg-red-50 rounded-xl text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500 mb-1" />
                  <p className="font-medium text-red-800 text-xs uppercase tracking-wide mb-1">Weak</p>
                  <p className="text-red-700">{weakAreas.slice(0, 2).join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 2: Score by topic ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="h-5 w-5 text-brand-500" />
          <h2 className="font-display text-lg font-semibold text-brand-900">Score by Topic</h2>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byTopic.map((t) => ({ topic: t.topic, accuracy: t.accuracy, score: t.score, max: t.maxScore }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} width={35} />
              <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
              <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                {byTopic.map((t, i) => (
                  <Cell key={i} fill={scoreColor(t.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {byTopic.map((t) => (
            <div
              key={t.topic}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
              style={{ background: `${scoreColor(t.accuracy)}18` }}
            >
              <span className="text-brand-700 truncate">{t.topic}</span>
              <span className="font-bold ml-2 shrink-0" style={{ color: scoreColor(t.accuracy) }}>
                {t.accuracy}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Card 3: Score by section ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-brand-500" />
          <h2 className="font-display text-lg font-semibold text-brand-900">Score by Section</h2>
        </div>
        <div className="space-y-3">
          {bySection.map((s) => (
            <div key={s.section}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-brand-700 font-medium">{s.section}</span>
                <span className="text-brand-500">
                  {s.score}/{s.maxScore} ({s.accuracy}%)
                </span>
              </div>
              <div className="h-2.5 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.accuracy}%`, background: scoreColor(s.accuracy) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Card 4: Time efficiency ───────────────────────────────────────────── */}
      {timingChartData.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-brand-500" />
            <h2 className="font-display text-lg font-semibold text-brand-900">Time Efficiency</h2>
            <span className="text-xs text-brand-400 ml-auto">marks per minute per question</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={30} />
                <Tooltip formatter={(v) => [`${v} marks/min`, 'Efficiency']} />
                <ReferenceLine
                  y={avgEfficiency}
                  stroke="#9CA3AF"
                  strokeDasharray="4 4"
                  label={{ value: 'avg', position: 'right', fontSize: 11, fill: '#9CA3AF' }}
                />
                <Line type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-brand-400 mt-2">
            Questions below the dashed line took longer than average relative to their marks.
          </p>
        </div>
      )}

      {/* ── Card 5: Confidence vs accuracy ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-brand-500" />
          <h2 className="font-display text-lg font-semibold text-brand-900">Confidence vs Accuracy</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <ConfidenceCard
            label="Questions you flagged for review"
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
            stat={confidenceAccuracy.markedForReview}
            color="amber"
            note="Trust your instincts less here — review these topics"
          />
          <ConfidenceCard
            label="Questions you were confident in"
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            stat={confidenceAccuracy.notMarked}
            color="green"
            note="You know this material — keep it up"
          />
        </div>
      </div>

      {/* ── Card 6: Weak areas ───────────────────────────────────────────────── */}
      {weakAreas.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="font-display text-lg font-semibold text-brand-900">Weak Areas</h2>
          </div>
          <div className="space-y-2">
            {weakAreas.map((area) => {
              const t = byTopic.find((t) => t.topic === area)
              return (
                <div key={area} className="flex items-center justify-between p-3 bg-red-50 rounded-xl text-sm">
                  <span className="font-medium text-red-800">{area}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">{t?.accuracy ?? 0}%</span>
                    <span className="text-red-400">accuracy</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Card 7: Next steps ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h2 className="font-display text-lg font-semibold text-brand-900">Next Steps</h2>
        </div>
        <ul className="space-y-3">
          {nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-brand-700">
              <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs shrink-0 mt-0.5">
                {i + 1}
              </div>
              {step}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/revision-plan" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">
            <TrendingUp className="h-4 w-4" />
            Update Revision Plan
          </Link>
          <Link href="/subjects" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 text-sm font-medium transition-colors">
            Study These Topics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Card 8: Class comparison ─────────────────────────────────────────── */}
      {classComparison && (
        <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-brand-500" />
            <h2 className="font-display text-lg font-semibold text-brand-900">Class Comparison</h2>
            <span className="text-xs text-brand-400 ml-auto">{classComparison.totalStudents} students</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-brand-50 rounded-xl">
              <p className="text-3xl font-bold text-brand-900">{classComparison.yourScore}%</p>
              <p className="text-xs text-brand-500 mt-1">Your Score</p>
            </div>
            <div className="text-center p-4 bg-brand-50 rounded-xl">
              <p className="text-3xl font-bold text-brand-500">{classComparison.classAverage}%</p>
              <p className="text-xs text-brand-500 mt-1">Class Average</p>
            </div>
            <div className="text-center p-4 bg-brand-50 rounded-xl">
              <p
                className="text-3xl font-bold"
                style={{ color: classComparison.percentile >= 50 ? '#10B981' : '#F59E0B' }}
              >
                Top {100 - classComparison.percentile}%
              </p>
              <p className="text-xs text-brand-500 mt-1">Percentile</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ConfidenceCard({
  label, icon, stat, color, note,
}: {
  label: string
  icon: React.ReactNode
  stat: { attempted: number; correct: number; accuracy: number }
  color: 'amber' | 'green'
  note: string
}) {
  const bg = color === 'amber' ? 'bg-amber-50' : 'bg-green-50'
  const textColor = color === 'amber' ? 'text-amber-800' : 'text-green-800'
  const subColor = color === 'amber' ? 'text-amber-600' : 'text-green-600'

  return (
    <div className={cn('p-4 rounded-xl', bg)}>
      <div className="flex items-start gap-2 mb-2">
        {icon}
        <p className={cn('text-sm font-medium', textColor)}>{label}</p>
      </div>
      {stat.attempted > 0 ? (
        <>
          <p className={cn('text-2xl font-bold', subColor)}>{stat.accuracy}%</p>
          <p className={cn('text-xs mt-1', subColor)}>
            {stat.correct}/{stat.attempted} correct
          </p>
          <p className={cn('text-xs mt-2 italic', subColor)}>{note}</p>
        </>
      ) : (
        <p className={cn('text-sm', subColor)}>No questions in this category</p>
      )}
    </div>
  )
}
