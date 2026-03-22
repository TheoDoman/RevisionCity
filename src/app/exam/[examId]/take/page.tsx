'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { ExamSimulation } from '@/components/exam/ExamSimulation'
import type { MockExamPublic } from '@/types'

export default function TakeExamPage() {
  const { examId } = useParams<{ examId: string }>()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [exam, setExam] = useState<MockExamPublic | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.replace('/sign-in'); return }

    fetch(`/api/exams/get?examId=${encodeURIComponent(examId)}`)
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) { setError(d.error ?? 'Exam not found'); return }
        setExam(d.exam)
      })
      .catch(() => setError('Failed to load exam'))
  }, [isLoaded, user, examId, router])

  function handleComplete(attemptId: string) {
    router.push(`/exam/${examId}/results/${attemptId}`)
  }

  if (!isLoaded || (!exam && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400 mx-auto mb-3" />
          <p className="text-brand-500 text-sm">Loading exam…</p>
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

  return <ExamSimulation exam={exam!} onComplete={handleComplete} />
}
