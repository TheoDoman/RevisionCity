'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface Question {
  id: number
  type: 'multiple_choice' | 'short_answer' | 'long_answer'
  question: string
  options?: string[]
  answer: string
  explanation: string
  marks: number
  difficulty: number
}

interface TestRecord {
  id: string
  subject_name: string
  topic_name: string
  exam_board: 'cambridge' | 'edexcel'
  difficulty: number
  question_count: number
  total_marks: number
  test_data: {
    questions: Question[]
    metadata: { subject: string; topic: string; totalMarks: number; difficulty: number; questionCount: number }
  }
  attempt_count: number
}

export default function AiTestPage() {
  const params = useParams<{ id: string }>()
  const { isLoaded, isSignedIn } = useUser()
  const [record, setRecord] = useState<TestRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !params?.id) return
    fetch(`/api/ai/generated-tests/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setRecord(data.test)
      })
      .catch(() => setError('Failed to load test'))
      .finally(() => setLoading(false))
  }, [isLoaded, isSignedIn, params?.id])

  const submit = () => {
    if (!record) return
    let earned = 0
    let max = 0
    record.test_data.questions.forEach((q, i) => {
      max += q.marks
      const userAns = answers[i]?.trim().toLowerCase()
      const correct = q.answer?.trim().toLowerCase()
      if (!userAns || !correct) return
      if (q.type === 'multiple_choice') {
        if (userAns === correct) earned += q.marks
      } else {
        if (userAns.includes(correct) || correct.includes(userAns)) earned += q.marks
      }
    })
    setScore(earned)
    setSubmitted(true)

    // Persist attempt
    fetch(`/api/ai/generated-tests/${params?.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: earned, maxScore: max }),
    }).catch(() => {})

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-brand-700 mb-4">Sign in to take this test</p>
          <Link href="/sign-in" className="btn-primary px-6 py-3">Sign in</Link>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-brand-700 mb-4">{error ?? 'Test not found.'}</p>
        <Link href="/ai-tests" className="btn-primary px-6 py-3">Back to my tests</Link>
      </div>
    )
  }

  const questions = record.test_data.questions
  const totalMarks = record.total_marks || questions.reduce((s, q) => s + q.marks, 0)
  const difficultyLabel = record.difficulty <= 3 ? 'Easy' : record.difficulty <= 7 ? 'Medium' : 'Hard'
  const boardLabel = record.exam_board === 'edexcel' ? 'Edexcel' : 'Cambridge'
  const allAnswered = questions.every((_, i) => answers[i]?.trim())

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/ai-tests" className="inline-flex items-center text-sm text-brand-600 hover:text-brand-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to my tests
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border-2 border-brand-100 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{boardLabel}</span>
            <span className="text-xs font-medium text-brand-500">{record.subject_name}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-950 mb-1">{record.topic_name}</h1>
          <p className="text-sm text-brand-500">
            {questions.length} questions · {totalMarks} marks · Difficulty: {difficultyLabel}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, i) => {
            const userAns = answers[i]?.trim().toLowerCase() ?? ''
            const correct = q.answer?.trim().toLowerCase() ?? ''
            const isCorrect = submitted && userAns && correct && (
              q.type === 'multiple_choice' ? userAns === correct : (userAns.includes(correct) || correct.includes(userAns))
            )

            return (
              <div key={i} className="bg-white rounded-2xl border-2 border-brand-100 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-brand-900 mb-1">{q.question}</p>
                    <p className="text-xs text-brand-500">{q.marks} mark{q.marks === 1 ? '' : 's'}</p>
                  </div>
                </div>

                {q.type === 'multiple_choice' && q.options ? (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[i] === opt
                      const isCorrectOption = submitted && opt.trim().toLowerCase() === correct
                      return (
                        <button
                          key={oi}
                          onClick={() => !submitted && setAnswers((p) => ({ ...p, [i]: opt }))}
                          disabled={submitted}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
                            submitted && isCorrectOption
                              ? 'border-green-400 bg-green-50 text-green-900'
                              : submitted && isSelected && !isCorrectOption
                                ? 'border-red-400 bg-red-50 text-red-900'
                                : isSelected
                                  ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
                                  : 'border-brand-100 hover:border-brand-300'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <textarea
                    rows={3}
                    value={answers[i] ?? ''}
                    onChange={(e) => setAnswers((p) => ({ ...p, [i]: e.target.value }))}
                    disabled={submitted}
                    placeholder="Type your answer..."
                    className="w-full p-3 rounded-xl border-2 border-brand-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm disabled:opacity-60"
                  />
                )}

                {submitted && (
                  <div className={`mt-4 p-3 rounded-xl text-sm ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-amber-600" />
                      )}
                      <span className="font-semibold text-brand-900">
                        {isCorrect ? 'Correct' : `Correct answer: ${q.answer}`}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className="text-brand-700 text-xs">{q.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Submit / results */}
        <div id="results" className="mt-6">
          {!submitted ? (
            <button
              onClick={submit}
              disabled={!allAnswered}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50"
            >
              {allAnswered ? 'Submit answers' : `Answer all ${questions.length} questions to submit`}
            </button>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-brand-100 p-6 text-center">
              <p className="text-sm text-brand-500 mb-2">Your score</p>
              <p className="text-5xl font-bold text-indigo-600 mb-2">
                {score}<span className="text-2xl text-brand-400">/{totalMarks}</span>
              </p>
              <p className="text-brand-700 mb-4">
                {score / totalMarks >= 0.8 ? '🎉 Excellent work!' :
                 score / totalMarks >= 0.6 ? '👍 Good effort!' :
                 score / totalMarks >= 0.4 ? '💪 Keep practicing!' :
                 'Review the explanations and try again.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={reset} className="btn-primary px-6 py-2">Retake</button>
                <Link href="/ai-tests" className="px-6 py-2 rounded-xl border-2 border-brand-200 text-brand-700 hover:border-brand-400">
                  Back to my tests
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
