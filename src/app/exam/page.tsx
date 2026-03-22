'use client'

import { useState, useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ClipboardList, Clock, BarChart2, Loader2, Lock, ChevronRight, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed'
const DURATIONS = [45, 60, 90] as const
const SUBJECTS = [
  { name: 'Biology', id: '' },
  { name: 'Chemistry', id: '' },
  { name: 'Physics', id: '' },
  { name: 'Mathematics', id: '' },
  { name: 'English', id: '' },
  { name: 'Business Studies', id: '' },
  { name: 'Economics', id: '' },
  { name: 'History', id: '' },
  { name: 'Geography', id: '' },
  { name: 'Computer Science', id: '' },
]

interface Attempt {
  id: string
  exam_id: string
  score: number
  max_score: number
  percentage: number
  grade: string
  completed_at: string
  mock_exams: {
    subject_name: string
    exam_board: string
    difficulty: string
    total_time_minutes: number
  }
}

export default function ExamPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const retakeId = searchParams.get('retake')

  const [subjectName, setSubjectName] = useState('Biology')
  const [examBoard, setExamBoard] = useState<'cambridge' | 'edexcel'>('cambridge')
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed')
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(90)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loadingAttempts, setLoadingAttempts] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoadingAttempts(true)
    fetch('/api/exams/list')
      .then((r) => r.json())
      .then((d) => setAttempts(d.attempts ?? []))
      .finally(() => setLoadingAttempts(false))
  }, [user])

  async function handleCreate() {
    if (!user) return
    setGenerating(true)
    setError('')
    try {
      // First get the subject ID from the subjects API
      const subjectsRes = await fetch(`/api/subjects?board=${examBoard}`)
      const subjectsData = await subjectsRes.json()
      const subject = subjectsData.subjects?.find(
        (s: { name: string; id: string }) => s.name.toLowerCase() === subjectName.toLowerCase()
      )

      const res = await fetch('/api/exams/create-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject?.id ?? subjectName.toLowerCase().replace(/\s+/g, '-'),
          subjectName,
          examBoard,
          difficulty,
          durationMinutes: duration,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate exam')
        if (data.upgradeRequired) setError(data.error)
        return
      }
      router.push(`/exam/${data.examId}/take`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const gradeColor = (g: string) => {
    const map: Record<string, string> = { 'A*': 'text-purple-700', A: 'text-blue-700', B: 'text-green-700', C: 'text-amber-700', D: 'text-orange-700', E: 'text-red-700', F: 'text-gray-600', G: 'text-gray-500', U: 'text-gray-400' }
    return map[g] ?? 'text-brand-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4 border border-brand-100">
            <ClipboardList className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">Mock Exam Centre</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-brand-950 mb-3">
            Mock Exam Simulator
          </h1>
          <p className="text-brand-600 text-lg max-w-2xl">
            Practise under timed exam conditions. Claude AI grades your responses and gives you a detailed breakdown by topic, section, and time efficiency.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create exam form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
              <h2 className="font-display text-lg font-semibold text-brand-900 mb-6">
                Create New Exam
              </h2>

              {!isLoaded && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                </div>
              )}

              {isLoaded && !user && (
                <div className="text-center py-10">
                  <Lock className="h-10 w-10 text-brand-300 mx-auto mb-3" />
                  <p className="text-brand-600 mb-4">Sign in to create your personalised mock exams</p>
                  <SignInButton mode="modal">
                    <button className="btn-primary px-6 py-2.5">Sign In to Start</button>
                  </SignInButton>
                </div>
              )}

              {isLoaded && user && (
                <div className="space-y-5">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">Subject</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SUBJECTS.map((s) => (
                        <button
                          key={s.name}
                          onClick={() => setSubjectName(s.name)}
                          className={cn(
                            'px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                            subjectName === s.name
                              ? 'border-brand-500 bg-brand-50 text-brand-800'
                              : 'border-brand-100 text-brand-600 hover:border-brand-200',
                          )}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exam board */}
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">Exam Board</label>
                    <div className="inline-flex bg-brand-100 rounded-xl p-1">
                      {(['cambridge', 'edexcel'] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => setExamBoard(b)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize',
                            examBoard === b ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-600',
                          )}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">Difficulty</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={cn(
                            'py-2 rounded-xl text-sm font-medium border-2 capitalize transition-all',
                            difficulty === d
                              ? 'border-brand-500 bg-brand-50 text-brand-800'
                              : 'border-brand-100 text-brand-600 hover:border-brand-200',
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {DURATIONS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          className={cn(
                            'py-2 rounded-xl text-sm font-medium border-2 transition-all',
                            duration === d
                              ? 'border-brand-500 bg-brand-50 text-brand-800'
                              : 'border-brand-100 text-brand-600 hover:border-brand-200',
                          )}
                        >
                          {d} min
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 rounded-xl text-sm text-red-700 flex items-start gap-2">
                      {error}
                      {error.includes('Upgrade') && (
                        <Link href="/pricing" className="ml-auto underline whitespace-nowrap shrink-0">
                          Upgrade →
                        </Link>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleCreate}
                    disabled={generating}
                    className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-60"
                  >
                    {generating ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating exam (10–20 sec)…
                      </span>
                    ) : (
                      'Generate Mock Exam'
                    )}
                  </button>

                  <p className="text-xs text-brand-400 text-center">
                    Free: 1 exam per month · Premium: unlimited exams
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border-2 border-brand-100 p-5">
              <h3 className="font-display text-base font-semibold text-brand-900 mb-4">What you get</h3>
              <ul className="space-y-3 text-sm text-brand-600">
                {[
                  { icon: Clock, text: 'Per-section countdown timer' },
                  { icon: ClipboardList, text: 'Realistic IGCSE-format questions' },
                  { icon: BarChart2, text: 'AI grades written answers' },
                  { icon: Star, text: 'Grade prediction + topic breakdown' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-brand-400 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent attempts */}
            {user && (
              <div className="bg-white rounded-2xl border-2 border-brand-100 p-5">
                <h3 className="font-display text-base font-semibold text-brand-900 mb-3">Recent Exams</h3>
                {loadingAttempts ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                  </div>
                ) : attempts.length === 0 ? (
                  <p className="text-sm text-brand-400">No exams taken yet</p>
                ) : (
                  <div className="space-y-2">
                    {attempts.slice(0, 5).map((a) => (
                      <Link
                        key={a.id}
                        href={`/exam/${a.exam_id}/results/${a.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-brand-800">
                            {a.mock_exams?.subject_name}
                          </p>
                          <p className="text-xs text-brand-400">
                            {a.mock_exams?.difficulty} · {a.mock_exams?.total_time_minutes} min
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-sm font-bold', gradeColor(a.grade))}>
                            {a.grade}
                          </span>
                          <span className="text-xs text-brand-400">{a.percentage}%</span>
                          <ChevronRight className="h-4 w-4 text-brand-300" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
