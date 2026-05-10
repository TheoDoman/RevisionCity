'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Calendar, ChevronDown, ChevronUp, Download, RefreshCw, Loader2,
  Target, Clock, Flame, CheckCircle2, Lock, AlertCircle, Star,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Subject, Topic, RevisionPlan, IGCSEGrade, ContentType } from '@/types'

interface Props {
  subject: Subject
  topics: Topic[]
}

type Step = 'idle' | 'form' | 'loading' | 'plan' | 'error'

const GRADE_ORDER: IGCSEGrade[] = ['U', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'A*']
const GRADE_COLORS: Record<IGCSEGrade, string> = {
  'A*': '#7C3AED', A: '#2563EB', B: '#059669', C: '#D97706',
  D: '#EA580C', E: '#DC2626', F: '#9CA3AF', G: '#6B7280', U: '#374151',
}

const CONTENT_LABELS: Record<ContentType, string> = {
  notes: 'Notes', flashcards: 'Flashcards', quiz: 'Quiz', practice: 'Practice', recall: 'Recall',
}

const LOADING_MESSAGES = [
  'Analysing your quiz history…',
  'Identifying weak areas…',
  'Applying spaced repetition principles…',
  'Balancing your weekly hours…',
  'Calculating grade trajectory…',
  'Building your personalised plan…',
]

function gradeToNumber(g: IGCSEGrade): number {
  return GRADE_ORDER.indexOf(g)
}

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + weeks * 7)
  return d
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

// ── ICS generation ────────────────────────────────────────────────────────────
function generateICS(plan: RevisionPlan, examDate: string): string {
  const start = new Date(plan.createdAt)
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Revision City//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const week of plan.weeks) {
    const weekStart = addWeeks(start, week.week - 1)
    const weekEnd = addWeeks(start, week.week)
    const summary = week.topicAllocations
      .map((a) => `${a.topicName} ${a.hours}h`)
      .join(', ')
    const description = week.topicAllocations
      .map((a) => `${a.topicName}: ${a.hours}hrs (${a.contentTypes.join(', ')})`)
      .join('\\n')
    const checkpoint = week.isCheckpoint ? ' [CHECKPOINT MINI-TEST]' : ''

    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${isoDate(weekStart)}`,
      `DTEND;VALUE=DATE:${isoDate(weekEnd)}`,
      `SUMMARY:Week ${week.week}: ${plan.subjectName} Revision${checkpoint}`,
      `DESCRIPTION:${description}\\nEstimated grade: ${week.estimatedGrade} (${week.estimatedPercentage}%)`,
      `UID:revision-city-${plan.id}-week${week.week}@revisioncity.app`,
      'END:VEVENT',
    )

    if (week.isCheckpoint) {
      const reminderDate = addWeeks(start, week.week - 1)
      reminderDate.setDate(reminderDate.getDate() - 3)
      lines.push(
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${isoDate(reminderDate)}`,
        `DTEND;VALUE=DATE:${isoDate(weekStart)}`,
        `SUMMARY:⚠️ Checkpoint Week ${week.week} in 3 days — ${plan.subjectName}`,
        `DESCRIPTION:Prepare for your 20-question mini-test checkpoint`,
        `UID:revision-city-${plan.id}-checkpoint${week.week}@revisioncity.app`,
        'END:VEVENT',
      )
    }
  }

  // Add exam date event
  lines.push(
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${examDate.replace(/-/g, '').slice(0, 8)}`,
    `DTEND;VALUE=DATE:${examDate.replace(/-/g, '').slice(0, 8)}`,
    `SUMMARY:🎓 ${plan.subjectName} IGCSE Exam`,
    `UID:revision-city-${plan.id}-exam@revisioncity.app`,
    'END:VEVENT',
    'END:VCALENDAR',
  )

  return lines.join('\r\n')
}

// ── CSV generation ────────────────────────────────────────────────────────────
function generateCSV(plan: RevisionPlan): string {
  const start = new Date(plan.createdAt)
  const rows = [['Week', 'Start Date', 'End Date', 'Topic', 'Hours', 'Content Types', 'Priority', 'Checkpoint']]

  for (const week of plan.weeks) {
    const weekStart = addWeeks(start, week.week - 1)
    const weekEnd = addWeeks(start, week.week)
    for (const alloc of week.topicAllocations) {
      rows.push([
        String(week.week),
        weekStart.toLocaleDateString('en-GB'),
        weekEnd.toLocaleDateString('en-GB'),
        alloc.topicName,
        String(alloc.hours),
        alloc.contentTypes.join('; '),
        alloc.priority,
        week.isCheckpoint ? 'Yes' : 'No',
      ])
    }
  }

  return rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
}

// ── PDF via print window ──────────────────────────────────────────────────────
function openPrintView(plan: RevisionPlan, examDate: string) {
  const start = new Date(plan.createdAt)
  const weeksHTML = plan.weeks
    .map((week) => {
      const weekStart = addWeeks(start, week.week - 1)
      const allocHTML = week.topicAllocations
        .map(
          (a) => `<li><strong>${a.topicName}</strong>: ${a.hours} hrs — ${a.contentTypes.join(', ')}</li>`,
        )
        .join('')
      return `
        <div class="week ${week.isCheckpoint ? 'checkpoint' : ''}" style="break-inside:avoid;margin-bottom:16px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">
          <h3 style="margin:0 0 6px">Week ${week.week} — ${formatDate(weekStart)}${week.isCheckpoint ? ' 🏁 CHECKPOINT' : ''}</h3>
          <p style="margin:0 0 4px;font-size:12px;color:#6b7280">Estimated grade: ${week.estimatedGrade} (${week.estimatedPercentage}%)</p>
          <ul style="margin:4px 0;padding-left:20px;">${allocHTML}</ul>
        </div>`
    })
    .join('')

  const html = `<!DOCTYPE html><html><head><title>${plan.subjectName} Revision Plan</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:22px}h2{font-size:16px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-top:24px}@media print{.no-print{display:none}}</style>
    </head><body>
    <button class="no-print" onclick="window.print()" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;margin-bottom:16px">Print / Save as PDF</button>
    <h1>${plan.subjectName} Revision Plan</h1>
    <p>Target: <strong>${plan.targetGrade}</strong> &nbsp;|&nbsp; Predicted: <strong>${plan.estimatedFinalGrade}</strong> &nbsp;|&nbsp; Exam: <strong>${new Date(examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
    <h2>Weekly Schedule</h2>
    <div style="columns:2;column-gap:16px">${weeksHTML}</div>
    </body></html>`

  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}

// ── Download helper ───────────────────────────────────────────────────────────
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────
export function RevisionPlanBuilder({ subject, topics }: Props) {
  const { user, isLoaded } = useUser()

  const [step, setStep] = useState<Step>('idle')
  const [plan, setPlan] = useState<RevisionPlan | null>(null)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [errorMsg, setErrorMsg] = useState('')
  const [expanded, setExpanded] = useState(false)

  // Form state
  const [examDate, setExamDate] = useState('')
  const [targetGrade, setTargetGrade] = useState<IGCSEGrade>('B')
  const [hoursPerWeek, setHoursPerWeek] = useState(10)

  // Load existing plan on mount
  useEffect(() => {
    if (!user || !isLoaded) return
    fetch(`/api/revision-plan/generate?subjectId=${encodeURIComponent(subject.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.plan) {
          setPlan(data.plan)
          setStep('plan')
          setExpanded(true)
        }
      })
      .catch(() => {})
  }, [user, isLoaded, subject.id])

  // Rotate loading messages
  useEffect(() => {
    if (step !== 'loading') return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[i])
    }, 2200)
    return () => clearInterval(interval)
  }, [step])

  // Auto-adjust plan
  useEffect(() => {
    if (!plan || !user) return
    fetch('/api/revision-plan/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.adjusted && data.updatedWeeks) {
          setPlan((p) => p ? { ...p, weeks: data.updatedWeeks } : p)
        }
      })
      .catch(() => {})
  }, [plan?.id, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = useCallback(async (replanning = false) => {
    if (!examDate) { setErrorMsg('Please set an exam date.'); return }
    if (!user) { setErrorMsg('You must be signed in.'); return }

    setStep('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/revision-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject.id,
          subjectName: subject.name,
          examBoard: subject.slug.endsWith('-edexcel') ? 'edexcel' : 'cambridge',
          examDate,
          targetGrade,
          hoursPerWeek,
          replanning,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStep('error')
        setErrorMsg(data.error ?? 'Something went wrong.')
        return
      }
      setPlan(data.plan)
      setStep('plan')
      setExpanded(true)
    } catch {
      setStep('error')
      setErrorMsg('Network error. Please try again.')
    }
  }, [examDate, user, subject.id, subject.name, subject.slug, targetGrade, hoursPerWeek])

  // ── Week count from plan start ─────────────────────────────────────────────
  const currentWeekNum = plan
    ? Math.max(1, Math.ceil((Date.now() - new Date(plan.createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 0

  const daysUntilExam = plan
    ? Math.max(0, Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-brand-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h2 className="font-display text-lg font-semibold text-brand-900">
              AI Revision Plan
              {plan && (
                <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              )}
            </h2>
            <p className="text-sm text-brand-500">
              {plan
                ? `Week ${currentWeekNum}/${plan.totalWeeks} · ${daysUntilExam} days to exam · Predicted ${plan.estimatedFinalGrade}`
                : 'Personalised weekly schedule with spaced repetition'}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-brand-400" /> : <ChevronDown className="h-5 w-5 text-brand-400" />}
      </button>

      {expanded && (
        <div className="border-t border-brand-100">
          {/* Not signed in */}
          {!user && isLoaded && (
            <div className="p-8 text-center">
              <Lock className="h-10 w-10 text-brand-300 mx-auto mb-3" />
              <p className="text-brand-600 mb-4">Sign in to create your personalised revision plan</p>
              <Link href="/sign-in" className="btn-primary inline-block px-6 py-2">Sign in</Link>
            </div>
          )}

          {/* Loading skeleton while checking auth */}
          {!isLoaded && (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
            </div>
          )}

          {/* Idle — show CTA if no plan */}
          {isLoaded && user && step === 'idle' && (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-brand-900 mb-2">
                Build Your Revision Plan
              </h3>
              <p className="text-brand-500 max-w-md mx-auto mb-6">
                Claude AI analyses your quiz history to create a personalised week-by-week plan with spaced repetition, grade predictions, and downloadable calendars.
              </p>
              <button
                onClick={() => setStep('form')}
                className="btn-primary px-8 py-3 text-base"
              >
                Create My Plan
              </button>
            </div>
          )}

          {/* Form */}
          {isLoaded && user && step === 'form' && (
            <div className="p-6 max-w-lg mx-auto">
              <h3 className="font-display text-lg font-semibold text-brand-900 mb-5">Plan Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full border-2 border-brand-200 rounded-xl px-4 py-2.5 text-brand-900 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">Target Grade</label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value as IGCSEGrade)}
                    className="w-full border-2 border-brand-200 rounded-xl px-4 py-2.5 text-brand-900 focus:outline-none focus:border-purple-400"
                  >
                    {(['A*', 'A', 'B', 'C', 'D'] as IGCSEGrade[]).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-700 mb-1">
                    Hours Available Per Week
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={4}
                      max={30}
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                      className="flex-1 accent-purple-600"
                    />
                    <span className="w-16 text-center font-medium text-brand-900 bg-brand-50 rounded-lg px-2 py-1">
                      {hoursPerWeek} hrs
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-brand-50 rounded-xl text-sm text-brand-600">
                  <strong>Note:</strong> Your quiz history will be auto-detected to personalise the plan. Topics with no quiz data will be treated as weak areas.
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(plan ? 'plan' : 'idle')}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleGenerate(false)}
                    className="flex-1 btn-primary py-2.5"
                  >
                    Generate Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {step === 'loading' && (
            <div className="p-12 text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <Loader2 className="h-16 w-16 animate-spin text-purple-300" />
                <Calendar className="h-7 w-7 text-purple-600 absolute inset-0 m-auto" />
              </div>
              <p className="text-brand-700 font-medium animate-pulse">{loadingMsg}</p>
              <p className="text-sm text-brand-400 mt-2">This usually takes 10–20 seconds</p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="p-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 mb-4">{errorMsg}</p>
              <button onClick={() => setStep('form')} className="btn-primary px-6 py-2">
                Try Again
              </button>
            </div>
          )}

          {/* Plan display */}
          {step === 'plan' && plan && (
            <PlanDisplay
              plan={plan}
              currentWeekNum={currentWeekNum}
              daysUntilExam={daysUntilExam}
              onReplan={() => {
                setExamDate(plan.examDate.slice(0, 10))
                setTargetGrade(plan.targetGrade)
                setHoursPerWeek(plan.hoursPerWeek)
                setStep('form')
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Plan Display sub-component ────────────────────────────────────────────────
function PlanDisplay({
  plan,
  currentWeekNum,
  daysUntilExam,
  onReplan,
}: {
  plan: RevisionPlan
  currentWeekNum: number
  daysUntilExam: number
  onReplan: () => void
}) {
  const planStart = new Date(plan.createdAt)

  const chartData = plan.gradeProgression.map((p) => ({
    name: p.week === 0 ? 'Now' : `Wk ${p.week}`,
    score: p.percentage,
    grade: p.grade,
  }))

  return (
    <div className="p-6 space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Target className="h-5 w-5" />} label="Target" value={plan.targetGrade} color="purple" />
        <StatCard icon={<Star className="h-5 w-5" />} label="Predicted" value={plan.estimatedFinalGrade} color="green" />
        <StatCard icon={<Calendar className="h-5 w-5" />} label="Days Left" value={String(daysUntilExam)} color="blue" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Hrs/Week" value={`${plan.hoursPerWeek}h`} color="orange" />
      </div>

      {/* Grade prediction chart */}
      <div>
        <h3 className="font-display text-base font-semibold text-brand-900 mb-4">Grade Progression</h3>
        <div className="h-48 bg-brand-50 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} width={40} />
              <Tooltip
                formatter={(v, _, entry) => [
                  `${v}% (Grade ${(entry as { payload: { grade: IGCSEGrade } }).payload.grade})`,
                  'Score',
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7C3AED"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#7C3AED' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly plan */}
      <div>
        <h3 className="font-display text-base font-semibold text-brand-900 mb-4">
          Week-by-Week Plan
        </h3>
        <div className="space-y-3">
          {plan.weeks.map((week) => {
            const weekStart = addWeeks(planStart, week.week - 1)
            const isCurrent = week.week === currentWeekNum
            const isPast = week.week < currentWeekNum

            return (
              <div
                key={week.week}
                className={cn(
                  'rounded-xl border-2 overflow-hidden transition-all',
                  isCurrent ? 'border-purple-400 shadow-md' : 'border-brand-100',
                  isPast ? 'opacity-60' : '',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-between px-4 py-3',
                    isCurrent ? 'bg-purple-50' : 'bg-brand-50',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-brand-900 text-sm">
                      Week {week.week} — {formatDate(weekStart)}
                    </span>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 bg-purple-600 text-white rounded-full">Current</span>
                    )}
                    {isPast && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {week.isCheckpoint && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                        🏁 Checkpoint
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: GRADE_COLORS[week.estimatedGrade] }}
                    >
                      {week.estimatedGrade}
                    </span>
                    <span className="text-xs text-brand-500">{week.estimatedPercentage}%</span>
                  </div>
                </div>

                <div className="px-4 py-3">
                  {week.isCheckpoint && (
                    <div className="mb-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                      <Flame className="h-3.5 w-3.5 inline mr-1" />
                      Checkpoint mini-test: 20 questions from your weakest topics
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {week.topicAllocations.map((alloc) => (
                      <div key={alloc.topicId} className="flex items-center gap-3 text-sm">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            alloc.priority === 'high'
                              ? 'bg-red-400'
                              : alloc.priority === 'medium'
                                ? 'bg-amber-400'
                                : 'bg-green-400',
                          )}
                        />
                        <span className="font-medium text-brand-800 w-32 truncate">{alloc.topicName}</span>
                        <span className="text-brand-500">{alloc.hours}h</span>
                        <div className="flex gap-1 flex-wrap">
                          {alloc.contentTypes.map((ct) => (
                            <span
                              key={ct}
                              className="text-xs px-1.5 py-0.5 bg-brand-100 text-brand-600 rounded"
                            >
                              {CONTENT_LABELS[ct]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Download + Re-plan buttons */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-brand-100">
        <button
          onClick={() => downloadBlob(generateICS(plan, plan.examDate), `${plan.subjectName}-revision-plan.ics`, 'text/calendar')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 text-sm transition-colors"
        >
          <Download className="h-4 w-4" /> Calendar (.ics)
        </button>
        <button
          onClick={() => downloadBlob(generateCSV(plan), `${plan.subjectName}-revision-plan.csv`, 'text/csv')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 text-sm transition-colors"
        >
          <Download className="h-4 w-4" /> Spreadsheet (.csv)
        </button>
        <button
          onClick={() => openPrintView(plan, plan.examDate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 text-sm transition-colors"
        >
          <Download className="h-4 w-4" /> PDF (print)
        </button>
        <div className="ml-auto">
          <button
            onClick={onReplan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Re-plan
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'purple' | 'green' | 'blue' | 'orange'
}) {
  const colors = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className="bg-brand-50 rounded-xl p-4 flex items-center gap-3">
      <div className={cn('p-2 rounded-lg', colors[color])}>{icon}</div>
      <div>
        <p className="text-xs text-brand-500">{label}</p>
        <p className="font-bold text-brand-900 text-lg leading-none mt-0.5">{value}</p>
      </div>
    </div>
  )
}
