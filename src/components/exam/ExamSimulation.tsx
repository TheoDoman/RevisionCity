'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle2, Loader2, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MockExamPublic, ExamSectionPublic, ExamQuestionPublic } from '@/types'

interface Props {
  exam: MockExamPublic
  onComplete: (attemptId: string) => void
}

type ExamState = 'start' | 'running' | 'section-end' | 'confirm-submit' | 'submitting'

function fmtTime(secs: number): string {
  const m = Math.floor(Math.abs(secs) / 60)
  const s = Math.abs(secs) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function flattenQuestions(exam: MockExamPublic) {
  return exam.sections.flatMap((s) => s.questions.map((q) => ({ ...q, sectionName: s.name })))
}

export function ExamSimulation({ exam, onComplete }: Props) {
  const [state, setExamState] = useState<ExamState>('start')
  const [sectionIdx, setSectionIdx] = useState(0)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [sectionTimeLeft, setSectionTimeLeft] = useState(0)
  const [timingData, setTimingData] = useState<Record<string, number>>({})

  // Track time per question
  const qStartRef = useRef<number>(Date.now())
  const curQIdRef = useRef<string>('')

  const currentSection: ExamSectionPublic = exam.sections[sectionIdx]
  const currentQuestion: ExamQuestionPublic = currentSection?.questions[questionIdx]
  const allFlat = flattenQuestions(exam)
  const totalQuestions = allFlat.length
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`exam-${exam.id}`)
      if (saved) {
        const { savedAnswers, savedFlagged } = JSON.parse(saved)
        if (savedAnswers) setAnswers(savedAnswers)
        if (savedFlagged) setFlagged(new Set(savedFlagged))
      }
    } catch {}
  }, [exam.id])

  // Save state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(`exam-${exam.id}`, JSON.stringify({ savedAnswers: answers, savedFlagged: Array.from(flagged) }))
    } catch {}
  }, [answers, flagged, exam.id])

  // Record time when leaving a question
  const recordTiming = useCallback(() => {
    const elapsed = Math.round((Date.now() - qStartRef.current) / 1000)
    if (curQIdRef.current && elapsed > 0) {
      setTimingData((prev) => ({ ...prev, [curQIdRef.current]: (prev[curQIdRef.current] ?? 0) + elapsed }))
    }
    qStartRef.current = Date.now()
  }, [])

  // Update current question ref
  useEffect(() => {
    if (currentQuestion) {
      recordTiming()
      curQIdRef.current = currentQuestion.id
      qStartRef.current = Date.now()
    }
  }, [currentQuestion?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Section countdown timer
  useEffect(() => {
    if (state !== 'running') return
    setSectionTimeLeft(currentSection.timeMinutes * 60)
  }, [sectionIdx, state]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state !== 'running') return
    if (sectionTimeLeft <= 0) return

    const t = setInterval(() => {
      setSectionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          recordTiming()
          setExamState('section-end')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [state, sectionTimeLeft === 0, recordTiming]) // eslint-disable-line react-hooks/exhaustive-deps

  function startExam() {
    setExamState('running')
    setSectionIdx(0)
    setQuestionIdx(0)
    curQIdRef.current = exam.sections[0].questions[0]?.id ?? ''
    qStartRef.current = Date.now()
  }

  function goToQuestion(sIdx: number, qIdx: number) {
    recordTiming()
    setSectionIdx(sIdx)
    setQuestionIdx(qIdx)
  }

  function prev() {
    if (questionIdx > 0) { goToQuestion(sectionIdx, questionIdx - 1); return }
    if (sectionIdx > 0) {
      const prevSection = exam.sections[sectionIdx - 1]
      goToQuestion(sectionIdx - 1, prevSection.questions.length - 1)
    }
  }

  function next() {
    if (questionIdx < currentSection.questions.length - 1) { goToQuestion(sectionIdx, questionIdx + 1); return }
    if (sectionIdx < exam.sections.length - 1) { goToQuestion(sectionIdx + 1, 0); return }
  }

  function advanceSection() {
    recordTiming()
    if (sectionIdx < exam.sections.length - 1) {
      setSectionIdx((i) => i + 1)
      setQuestionIdx(0)
      setExamState('running')
    } else {
      setExamState('confirm-submit')
    }
  }

  async function submitExam() {
    recordTiming()
    setExamState('submitting')
    try {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          answers,
          timingData,
          markedForReview: Array.from(flagged),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409 && data.attemptId) { onComplete(data.attemptId); return }
        alert(data.error ?? 'Submission failed. Please try again.')
        setExamState('running')
        return
      }
      localStorage.removeItem(`exam-${exam.id}`)
      onComplete(data.attemptId)
    } catch {
      alert('Network error. Please try again.')
      setExamState('running')
    }
  }

  const timerColor =
    sectionTimeLeft > 300 ? 'text-brand-700' : sectionTimeLeft > 60 ? 'text-amber-600' : 'text-red-600'

  // ── Start screen ─────────────────────────────────────────────────────────────
  if (state === 'start') {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border-2 border-brand-100 p-8 max-w-lg w-full shadow-lg">
          <h1 className="font-display text-2xl font-bold text-brand-950 mb-2">
            {exam.subjectName} Mock Exam
          </h1>
          <p className="text-brand-500 text-sm mb-6">
            {exam.examBoard.charAt(0).toUpperCase() + exam.examBoard.slice(1)} IGCSE ·{' '}
            {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)} · {exam.totalTimeMinutes} min
          </p>

          <div className="space-y-3 mb-8">
            {exam.sections.map((s, i) => (
              <div key={s.id} className="flex justify-between text-sm bg-brand-50 rounded-xl px-4 py-3">
                <span className="font-medium text-brand-800">
                  {i + 1}. {s.name}
                </span>
                <span className="text-brand-500">
                  {s.questions.length} questions · {s.timeMinutes} min · {s.totalMarks} marks
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold px-4 py-2 bg-brand-100 rounded-xl">
              <span>Total</span>
              <span>{exam.totalMarks} marks · {exam.totalTimeMinutes} min</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-6">
            <strong>Instructions:</strong> Attempt all questions. Each section has a time limit —
            you will auto-advance when time runs out. You can flag questions for review using the flag icon.
          </div>

          <button
            onClick={startExam}
            className="w-full btn-primary py-3 text-base font-semibold"
          >
            Start Exam
          </button>
        </div>
      </div>
    )
  }

  // ── Section end ───────────────────────────────────────────────────────────────
  if (state === 'section-end') {
    const isLast = sectionIdx >= exam.sections.length - 1
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border-2 border-brand-100 p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="font-display text-xl font-bold text-brand-950 mb-2">
            {currentSection.name} — Time&apos;s Up
          </h2>
          <p className="text-brand-600 mb-6">
            {isLast
              ? 'That was the final section. You can now submit your exam.'
              : `Moving to ${exam.sections[sectionIdx + 1]?.name}…`}
          </p>
          <button onClick={advanceSection} className="btn-primary px-8 py-3">
            {isLast ? 'Review & Submit' : `Begin ${exam.sections[sectionIdx + 1]?.name}`}
          </button>
        </div>
      </div>
    )
  }

  // ── Confirm submit ─────────────────────────────────────────────────────────────
  if (state === 'confirm-submit') {
    const unanswered = totalQuestions - answeredCount
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border-2 border-brand-100 p-8 max-w-md w-full shadow-lg text-center">
          <Send className="h-12 w-12 text-brand-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-brand-950 mb-2">Submit Exam?</h2>
          {unanswered > 0 ? (
            <p className="text-amber-600 mb-4">
              You have <strong>{unanswered}</strong> unanswered question{unanswered > 1 ? 's' : ''}.
            </p>
          ) : (
            <p className="text-green-600 mb-4">All questions answered.</p>
          )}
          <p className="text-brand-500 text-sm mb-6">
            Once submitted, you cannot change your answers. Your results will be available immediately.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setExamState('running')}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-medium"
            >
              Go Back
            </button>
            <button onClick={submitExam} className="flex-1 btn-primary py-3">
              Submit
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Submitting ─────────────────────────────────────────────────────────────────
  if (state === 'submitting') {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-400 mx-auto mb-4" />
          <p className="text-brand-700 font-medium">Grading your exam…</p>
          <p className="text-sm text-brand-400 mt-2">Claude AI is analysing your responses</p>
        </div>
      </div>
    )
  }

  // ── Running ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-brand-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-display font-bold text-brand-900 truncate text-sm sm:text-base">
              {exam.subjectName}
            </span>
            <span className="text-brand-300 hidden sm:inline">·</span>
            <span className="text-brand-500 text-sm hidden sm:inline">{currentSection.name}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={cn('flex items-center gap-1.5 font-mono font-bold text-lg', timerColor)}>
              <Clock className="h-4 w-4" />
              {fmtTime(sectionTimeLeft)}
            </div>
            {/* Progress */}
            <span className="text-xs text-brand-500 hidden sm:inline">
              {answeredCount}/{totalQuestions} answered
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-5xl mx-auto mt-2">
          <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all"
              style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-5xl mx-auto w-full p-4 gap-4">
        {/* Main question area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border-2 border-brand-100 p-6 mb-4">
            {/* Question header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wide">
                  Question {questionIdx + 1} of {currentSection.questions.length}
                </span>
                <p className="text-xs text-brand-400 mt-0.5">
                  Topic: {currentQuestion.topic} · {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() =>
                  setFlagged((prev) => {
                    const next = new Set(prev)
                    next.has(currentQuestion.id) ? next.delete(currentQuestion.id) : next.add(currentQuestion.id)
                    return next
                  })
                }
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  flagged.has(currentQuestion.id)
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-brand-100 text-brand-600 hover:bg-brand-200',
                )}
              >
                <Flag className="h-3.5 w-3.5" />
                {flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {/* Question text */}
            <p className="text-brand-900 text-base leading-relaxed mb-6 whitespace-pre-wrap">
              {currentQuestion.text}
            </p>

            {/* Answer input */}
            <QuestionInput
              question={currentQuestion}
              answer={answers[currentQuestion.id] ?? ''}
              onChange={(val) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))
              }
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prev}
              disabled={sectionIdx === 0 && questionIdx === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {/* Section indicator */}
            <div className="flex gap-1.5">
              {exam.sections.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === sectionIdx ? 'w-8 bg-brand-500' : i < sectionIdx ? 'w-2 bg-brand-300' : 'w-2 bg-brand-200',
                  )}
                />
              ))}
            </div>

            {sectionIdx === exam.sections.length - 1 &&
            questionIdx === currentSection.questions.length - 1 ? (
              <button
                onClick={() => { recordTiming(); setExamState('confirm-submit') }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm"
              >
                <Send className="h-4 w-4" />
                Submit Exam
              </button>
            ) : (
              <button
                onClick={next}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-medium text-sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question nav panel */}
        <div className="hidden lg:block w-48 shrink-0">
          <div className="bg-white rounded-2xl border-2 border-brand-100 p-4 sticky top-24">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">
              Questions
            </p>
            <div className="space-y-3">
              {exam.sections.map((section, si) => (
                <div key={section.id}>
                  <p className="text-xs text-brand-400 mb-1.5 truncate">{section.name.split(':')[1]?.trim() ?? section.name}</p>
                  <div className="grid grid-cols-5 gap-1">
                    {section.questions.map((q, qi) => {
                      const isAnswered = !!(answers[q.id]?.trim())
                      const isFlagged = flagged.has(q.id)
                      const isCurrent = si === sectionIdx && qi === questionIdx
                      return (
                        <button
                          key={q.id}
                          onClick={() => goToQuestion(si, qi)}
                          className={cn(
                            'w-7 h-7 rounded-lg text-xs font-medium transition-all',
                            isCurrent
                              ? 'bg-brand-600 text-white ring-2 ring-brand-400'
                              : isFlagged
                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                : isAnswered
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-brand-100 text-brand-500 hover:bg-brand-200',
                          )}
                        >
                          {qi + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-brand-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />Flagged
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-brand-100 border border-brand-200" />Not answered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Question input component ──────────────────────────────────────────────────
function QuestionInput({
  question,
  answer,
  onChange,
}: {
  question: ExamQuestionPublic
  answer: string
  onChange: (v: string) => void
}) {
  if (question.type === 'multiple_choice') {
    return (
      <div className="space-y-2">
        {(question.options ?? []).map((opt) => {
          const letter = opt.charAt(0)
          return (
            <label
              key={opt}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                answer === letter
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-brand-100 hover:border-brand-200 bg-white',
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={letter}
                checked={answer === letter}
                onChange={() => onChange(letter)}
                className="mt-0.5 accent-brand-600"
              />
              <span className="text-brand-800 text-sm leading-relaxed">{opt}</span>
            </label>
          )
        })}
      </div>
    )
  }

  if (question.type === 'short_answer') {
    return (
      <div>
        <textarea
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your answer here…"
          rows={5}
          className="w-full border-2 border-brand-200 rounded-xl px-4 py-3 text-brand-900 text-sm focus:outline-none focus:border-brand-400 resize-y"
        />
        <p className="text-xs text-brand-400 mt-1 text-right">
          {answer.trim().split(/\s+/).filter(Boolean).length} words
        </p>
      </div>
    )
  }

  // Extended response
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length
  return (
    <div>
      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a detailed, structured response here…"
        rows={12}
        className="w-full border-2 border-brand-200 rounded-xl px-4 py-3 text-brand-900 text-sm focus:outline-none focus:border-brand-400 resize-y"
      />
      <div className="flex justify-between text-xs text-brand-400 mt-1">
        <span>Aim for ~200-300 words for an 8-mark question</span>
        <span className={wordCount < 80 ? 'text-amber-500' : 'text-green-600'}>{wordCount} words</span>
      </div>
    </div>
  )
}

export { CheckCircle2 } // re-export for convenience
