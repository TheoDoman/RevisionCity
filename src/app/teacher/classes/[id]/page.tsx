'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  ArrowLeft, Loader2, Copy, CheckCircle2, RefreshCw,
  Users, Trophy, Clock, BookOpen, Sparkles, ChevronDown, ChevronRight,
  AlertCircle, Archive, UserMinus, Mail,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ExamAttempt {
  id: string
  score: number | null
  max_score: number | null
  percentage: number | null
  grade: string | null
  completed_at: string
  mock_exams: { subject_name: string; exam_board: string; difficulty: string }
}

interface AiTest {
  id: string
  subject_name: string
  topic_name: string
  last_score: number | null
  last_max_score: number | null
  last_taken_at: string | null
  attempt_count: number
  created_at: string
}

interface StudentRow {
  id: string
  name: string
  email: string | null
  imageUrl: string | null
  joined_at: string | null
  recent_exam_attempts: ExamAttempt[]
  recent_ai_tests: AiTest[]
  activity_count_30d: number
  avg_exam_percentage: number | null
}

interface ClassDetail {
  class: {
    id: string
    name: string
    join_code: string
    archived_at: string | null
    created_at: string
    teacher_id: string
    teacher_name: string
    is_teacher: boolean
    member_count: number
  }
  students: StudentRow[]
  aggregates: {
    total_exams_taken: number
    class_avg_percentage: number | null
  }
}

function gradeColor(pct: number | null) {
  if (pct === null) return 'text-brand-400'
  if (pct >= 70) return 'text-green-600'
  if (pct >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [data, setData] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(() => {
    if (!params?.id) return
    setLoading(true)
    fetch(`/api/classes/${params.id}`)
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) {
          setError(d.error ?? 'Failed to load class')
        } else {
          setData(d)
        }
      })
      .finally(() => setLoading(false))
  }, [params?.id])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }
    reload()
  }, [isLoaded, isSignedIn, reload, router])

  const copyCode = () => {
    if (!data) return
    navigator.clipboard.writeText(data.class.join_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const regenerateCode = async () => {
    if (!data || !confirm('Regenerate the join code? Old code will stop working.')) return
    setBusy(true)
    try {
      await fetch(`/api/classes/${data.class.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate_code: true }),
      })
      reload()
    } finally { setBusy(false) }
  }

  const archiveClass = async () => {
    if (!data || !confirm(`Archive "${data.class.name}"? Students will lose access.`)) return
    setBusy(true)
    try {
      await fetch(`/api/classes/${data.class.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive: true }),
      })
      router.push('/teacher')
    } finally { setBusy(false) }
  }

  const removeStudent = async (studentId: string, name: string) => {
    if (!data || !confirm(`Remove ${name} from this class?`)) return
    setBusy(true)
    try {
      await fetch(`/api/classes/${data.class.id}/members/${studentId}`, { method: 'DELETE' })
      reload()
    } finally { setBusy(false) }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertCircle className="h-10 w-10 text-brand-400 mb-3" />
        <p className="text-brand-700 mb-4">{error ?? 'Class not found'}</p>
        <Link href={user?.publicMetadata?.role === 'teacher' ? '/teacher' : '/dashboard'} className="btn-primary px-6 py-3">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const isTeacherView = data.class.is_teacher
  const backLink = isTeacherView ? '/teacher' : '/dashboard'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-brand-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href={backLink} className="inline-flex items-center text-sm text-brand-600 hover:text-brand-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {isTeacherView ? 'Teacher' : ''} Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border-2 border-brand-100 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-950 mb-1 break-words">
                {data.class.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-brand-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {data.class.member_count} student{data.class.member_count === 1 ? '' : 's'}
                </span>
                {!isTeacherView && (
                  <>
                    <span>·</span>
                    <span>Teacher: {data.class.teacher_name}</span>
                  </>
                )}
                <span>·</span>
                <span>Created {formatDate(data.class.created_at)}</span>
              </div>
            </div>
            {isTeacherView && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-xs text-purple-700">Join code:</span>
                  <span className="font-mono font-bold text-purple-900 tracking-wider">{data.class.join_code}</span>
                  <button onClick={copyCode} className="text-purple-600 hover:text-purple-900 transition-colors">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={regenerateCode}
                  disabled={busy}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors text-xs disabled:opacity-50"
                  title="Regenerate join code"
                >
                  <RefreshCw className="h-3 w-3" />
                  New code
                </button>
                <button
                  onClick={archiveClass}
                  disabled={busy}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors text-xs disabled:opacity-50"
                >
                  <Archive className="h-3 w-3" />
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Aggregate stats (teacher view) */}
        {isTeacherView && (
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<Users className="h-5 w-5 text-purple-600" />}
              label="Students enrolled"
              value={String(data.class.member_count)}
            />
            <StatCard
              icon={<Trophy className="h-5 w-5 text-amber-600" />}
              label="Class avg score"
              value={data.aggregates.class_avg_percentage !== null ? `${data.aggregates.class_avg_percentage}%` : '—'}
            />
            <StatCard
              icon={<Clock className="h-5 w-5 text-blue-600" />}
              label="Exams taken (recent)"
              value={String(data.aggregates.total_exams_taken)}
            />
          </div>
        )}

        {/* Students */}
        <div className="bg-white rounded-2xl border-2 border-brand-100">
          <div className="px-6 py-4 border-b border-brand-100">
            <h2 className="font-display text-lg font-semibold text-brand-900">
              {isTeacherView ? 'Students' : 'My progress'}
            </h2>
          </div>

          {data.students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-10 w-10 text-brand-300 mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-brand-800 mb-2">
                No students yet
              </h3>
              <p className="text-brand-500 mb-4 max-w-md mx-auto">
                Share your class join code <span className="font-mono font-bold text-brand-900">{data.class.join_code}</span> with students. They can join at <Link href="/classes/join" className="text-purple-600 underline">/classes/join</Link>.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-brand-100">
              {data.students.map((s) => {
                const expanded = expandedStudent === s.id
                return (
                  <div key={s.id} className="p-5">
                    <button
                      onClick={() => setExpandedStudent(expanded ? null : s.id)}
                      className="w-full flex items-center justify-between gap-4 text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {s.imageUrl ? (
                          <Image
                            src={s.imageUrl}
                            alt={s.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center justify-center text-sm shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-brand-900 truncate">{s.name}</p>
                          {isTeacherView && s.email && (
                            <p className="text-xs text-brand-500 flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 shrink-0" />
                              {s.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 text-sm shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-brand-400">Avg score</p>
                          <p className={`font-bold ${gradeColor(s.avg_exam_percentage)}`}>
                            {s.avg_exam_percentage !== null ? `${s.avg_exam_percentage}%` : '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-brand-400">Activity (30d)</p>
                          <p className="font-bold text-brand-900">{s.activity_count_30d}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-brand-400">Exams</p>
                          <p className="font-bold text-brand-900">{s.recent_exam_attempts.length}</p>
                        </div>
                      </div>
                      {expanded ? <ChevronDown className="h-4 w-4 text-brand-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-brand-400 shrink-0" />}
                    </button>

                    {expanded && (
                      <div className="mt-5 pl-13 space-y-5">
                        {/* Mock exams */}
                        <div>
                          <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Recent mock exams
                          </h4>
                          {s.recent_exam_attempts.length === 0 ? (
                            <p className="text-sm text-brand-400 italic">No exams taken yet.</p>
                          ) : (
                            <div className="space-y-1">
                              {s.recent_exam_attempts.map((a) => {
                                const meta = (Array.isArray(a.mock_exams) ? a.mock_exams[0] : a.mock_exams) as ExamAttempt['mock_exams']
                                return (
                                  <div key={a.id} className="flex items-center gap-3 text-sm py-1.5">
                                    <span className="text-brand-700 flex-1 truncate">
                                      {meta?.subject_name ?? 'Exam'}
                                      <span className="text-xs text-brand-400 ml-2">{meta?.exam_board} · {meta?.difficulty}</span>
                                    </span>
                                    <span className={`font-bold ${gradeColor(a.percentage)}`}>
                                      {a.score !== null && a.max_score !== null ? `${a.score}/${a.max_score}` : '—'}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full bg-brand-50 ${gradeColor(a.percentage)}`}>
                                      {a.grade ?? '—'}
                                    </span>
                                    <span className="text-xs text-brand-400 w-20 text-right">
                                      {formatDate(a.completed_at)}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* AI tests */}
                        <div>
                          <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI practice tests
                          </h4>
                          {s.recent_ai_tests.length === 0 ? (
                            <p className="text-sm text-brand-400 italic">No AI tests generated yet.</p>
                          ) : (
                            <div className="space-y-1">
                              {s.recent_ai_tests.map((t) => {
                                const pct = t.last_score !== null && t.last_max_score && t.last_max_score > 0
                                  ? Math.round((t.last_score / t.last_max_score) * 100)
                                  : null
                                return (
                                  <div key={t.id} className="flex items-center gap-3 text-sm py-1.5">
                                    <span className="text-brand-700 flex-1 truncate">
                                      {t.topic_name}
                                      <span className="text-xs text-brand-400 ml-2">{t.subject_name}</span>
                                    </span>
                                    <span className={`font-bold ${gradeColor(pct)}`}>
                                      {pct !== null ? `${pct}%` : 'Not taken'}
                                    </span>
                                    <span className="text-xs text-brand-400">
                                      {t.attempt_count} attempt{t.attempt_count === 1 ? '' : 's'}
                                    </span>
                                    <span className="text-xs text-brand-400 w-20 text-right">
                                      {formatDate(t.created_at)}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Teacher actions */}
                        {isTeacherView && (
                          <div className="pt-2 border-t border-brand-100">
                            <button
                              onClick={() => removeStudent(s.id, s.name)}
                              disabled={busy}
                              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                              <UserMinus className="h-3 w-3" />
                              Remove from class
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-100 p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">{icon}</div>
        <span className="text-xs font-medium text-brand-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-brand-900 mt-1">{value}</p>
    </div>
  )
}
