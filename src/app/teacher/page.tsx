'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  GraduationCap, Plus, Users, BookOpen, BarChart2,
  Loader2, ArrowRight, Copy, CheckCircle2, Sparkles, ClipboardList,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface TeacherClass {
  id: string
  name: string
  join_code: string
  archived_at: string | null
  created_at: string
  student_count: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Auth + role gate
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }
    const role = user?.publicMetadata?.role
    if (role !== 'teacher') {
      router.replace(role === 'student' ? '/dashboard' : '/onboarding')
    }
  }, [isLoaded, isSignedIn, user, router])

  // Load classes
  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/classes')
      .then((r) => r.json())
      .then((data) => setClasses(data.teacherClasses ?? []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false))
  }, [isSignedIn])

  const createClass = async () => {
    const name = newClassName.trim()
    if (!name) return
    setCreating(true)
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create class')
      // Reload list
      const listRes = await fetch('/api/classes').then((r) => r.json())
      setClasses(listRes.teacherClasses ?? [])
      setShowCreate(false)
      setNewClassName('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create class')
    } finally {
      setCreating(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  const totalStudents = classes.reduce((s, c) => s + c.student_count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-brand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold text-brand-950">
                Teacher Dashboard
              </h1>
            </div>
            <p className="text-brand-600 ml-13">
              Welcome back, {user?.firstName || 'Teacher'}.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
          >
            <Plus className="h-4 w-4" />
            New Class
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<ClipboardList className="h-5 w-5 text-purple-600" />}
            label="Active classes"
            value={String(classes.length)}
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-blue-600" />}
            label="Total students"
            value={String(totalStudents)}
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5 text-emerald-600" />}
            label="Track progress in real time"
            value="Live"
          />
        </div>

        {/* Empty state */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-purple-200 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-purple-600" />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-900 mb-2">
              Create your first class
            </h2>
            <p className="text-brand-600 mb-6 max-w-md mx-auto">
              Classes are how you track a group of students. You'll get a join code to share, and you'll see each student's mock exam scores, AI tests, and study activity.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Create a class
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <Link
                key={c.id}
                href={`/teacher/classes/${c.id}`}
                className="group bg-white rounded-2xl border-2 border-brand-100 p-5 hover:border-purple-400 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display text-lg font-semibold text-brand-900 line-clamp-2">
                    {c.name}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-brand-300 group-hover:text-purple-500 transition-colors shrink-0" />
                </div>
                <div className="flex items-center gap-3 text-xs text-brand-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {c.student_count} student{c.student_count === 1 ? '' : 's'}
                  </span>
                  <span>·</span>
                  <span>Created {formatDate(c.created_at)}</span>
                </div>
                <div
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyCode(c.join_code) }}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-brand-50 group-hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <div className="text-xs text-brand-500">
                    Join code:
                    <span className="ml-2 font-mono font-bold text-brand-900 tracking-wider">
                      {c.join_code}
                    </span>
                  </div>
                  {copiedCode === c.join_code ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-brand-400" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="mt-12 bg-white rounded-2xl border border-brand-100 p-6">
          <h3 className="font-display text-base font-semibold text-brand-900 mb-3 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-purple-500" />
            Helpful for teachers
          </h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <Link href="/subjects" className="px-4 py-3 rounded-xl border border-brand-100 hover:border-purple-300 transition-colors">
              <div className="font-medium text-brand-900 mb-0.5">Browse content</div>
              <div className="text-xs text-brand-500">Notes & quizzes by subject</div>
            </Link>
            <Link href="/exam" className="px-4 py-3 rounded-xl border border-brand-100 hover:border-purple-300 transition-colors">
              <div className="font-medium text-brand-900 mb-0.5">Mock exams</div>
              <div className="text-xs text-brand-500">Generate or browse</div>
            </Link>
            <Link href="/ai-generator" className="px-4 py-3 rounded-xl border border-brand-100 hover:border-purple-300 transition-colors">
              <div className="font-medium text-brand-900 mb-0.5">AI Test Generator</div>
              <div className="text-xs text-brand-500">Custom practice tests</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Create-class modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !creating) setShowCreate(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="font-display text-xl font-bold text-brand-900 mb-2">Create a new class</h2>
            <p className="text-sm text-brand-600 mb-5">
              Give it a name your students will recognise. You can rename it later.
            </p>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Y10 Biology — 4B"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter' && newClassName.trim()) createClass() }}
              className="w-full px-4 py-3 rounded-xl border-2 border-brand-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { if (!creating) { setShowCreate(false); setNewClassName('') } }}
                disabled={creating}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createClass}
                disabled={!newClassName.trim() || creating}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? 'Creating...' : 'Create class'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-100 p-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-medium text-brand-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-3xl font-bold text-brand-900 mt-1">{value}</p>
    </div>
  )
}
