'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { MockExamResults } from '@/components/exam/MockExamResults'
import type { ExamAnalysis } from '@/types'
import { createClient } from '@supabase/supabase-js'

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResultsPage() {
  const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>()
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const [analysis, setAnalysis] = useState<ExamAnalysis | null>(null)
  const [meta, setMeta] = useState<{ subjectName: string; examBoard: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.replace('/sign-in'); return }

    // Fetch attempt + exam meta via API (service role not available client-side)
    fetch(`/api/exams/attempt?attemptId=${encodeURIComponent(attemptId)}`)
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) { setError(d.error ?? 'Results not found'); return }
        setAnalysis(d.analysis)
        setMeta({ subjectName: d.subjectName, examBoard: d.examBoard })
      })
      .catch(() => setError('Failed to load results'))
  }, [isLoaded, user, attemptId, router])

  if (!isLoaded || (!analysis && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400 mx-auto mb-3" />
          <p className="text-brand-500 text-sm">Loading results…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-brand-700 font-medium mb-4">{error}</p>
          <a href="/exam" className="btn-primary px-6 py-2.5">Back to Exams</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-50 pb-12">
      <MockExamResults
        analysis={analysis!}
        examId={examId}
        subjectName={meta?.subjectName ?? 'Exam'}
        examBoard={meta?.examBoard ?? 'cambridge'}
      />
    </div>
  )
}
