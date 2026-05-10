'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Loader2, Sparkles, Trash2, Clock, Trophy, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface SavedTest {
  id: string
  subject_name: string
  topic_name: string
  exam_board: 'cambridge' | 'edexcel'
  difficulty: number
  question_count: number
  total_marks: number
  last_score: number | null
  last_max_score: number | null
  last_taken_at: string | null
  attempt_count: number
  created_at: string
}

export default function AiTestsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [tests, setTests] = useState<SavedTest[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false)
      return
    }
    fetch('/api/ai/generated-tests/list')
      .then((r) => r.json())
      .then((data) => setTests(data.tests ?? []))
      .catch(() => setTests([]))
      .finally(() => setLoading(false))
  }, [isLoaded, isSignedIn])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this saved test? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/ai/generated-tests/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTests((prev) => prev.filter((t) => t.id !== id))
      }
    } finally {
      setDeleting(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-950 mb-4">
            Sign in to see your saved tests
          </h1>
          <p className="text-brand-600 mb-6">
            Every AI-generated test is saved to your account so you can revisit and retake it.
          </p>
          <Link href="/sign-in" className="btn-primary px-6 py-3 inline-block">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Link href="/ai-generator" className="inline-flex items-center text-sm text-brand-600 hover:text-brand-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to AI Test Generator
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-brand-950">My Saved Tests</h1>
        </div>
        <p className="text-brand-600 mb-8">
          Every AI-generated test you create is saved here. Retake any of them to see how you improve.
        </p>

        {/* Empty state */}
        {tests.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-brand-200 p-12 text-center">
            <FileText className="h-10 w-10 text-brand-300 mx-auto mb-4" />
            <h2 className="font-display text-lg font-semibold text-brand-800 mb-2">
              No saved tests yet
            </h2>
            <p className="text-brand-500 mb-6">
              Generate your first test and it will appear here automatically.
            </p>
            <Link href="/ai-generator" className="btn-primary inline-block px-6 py-3">
              Generate a test
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map((t) => {
              const pct = t.last_score !== null && t.last_max_score && t.last_max_score > 0
                ? Math.round((t.last_score / t.last_max_score) * 100)
                : null
              const difficultyLabel = t.difficulty <= 3 ? 'Easy' : t.difficulty <= 7 ? 'Medium' : 'Hard'
              const boardLabel = t.exam_board === 'edexcel' ? 'Edexcel' : 'Cambridge'

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border-2 border-brand-100 p-5 hover:border-brand-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                          {boardLabel}
                        </span>
                        <span className="text-xs font-medium text-brand-500">
                          {t.subject_name}
                        </span>
                      </div>
                      <h2 className="font-display text-lg font-semibold text-brand-900 mb-1">
                        {t.topic_name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-brand-500">
                        <span>{t.question_count} questions · {t.total_marks} marks</span>
                        <span>Difficulty: {difficultyLabel} ({t.difficulty}/10)</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(t.created_at)}
                        </span>
                      </div>

                      {/* Score */}
                      {t.last_taken_at && pct !== null ? (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <Trophy className={`h-4 w-4 ${pct >= 70 ? 'text-green-500' : pct >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
                          <span className="font-medium text-brand-800">
                            Last score: {t.last_score}/{t.last_max_score} ({pct}%)
                          </span>
                          <span className="text-brand-400">
                            · {t.attempt_count} attempt{t.attempt_count === 1 ? '' : 's'}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-brand-400">Not attempted yet</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Link
                        href={`/ai-tests/${t.id}`}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        {t.last_taken_at ? 'Retake' : 'Take test'}
                      </Link>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deleting === t.id}
                        className="px-4 py-2 rounded-xl border-2 border-brand-200 text-brand-500 hover:border-red-300 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
