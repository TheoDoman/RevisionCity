'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { GraduationCap, BookOpen, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [submitting, setSubmitting] = useState<'student' | 'teacher' | null>(null)

  // If user already has a role set, skip onboarding
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }
    const role = user?.publicMetadata?.role
    if (role === 'teacher') router.replace('/teacher')
    else if (role === 'student') router.replace('/dashboard')
  }, [isLoaded, isSignedIn, user, router])

  const pickRole = async (role: 'student' | 'teacher') => {
    setSubmitting(role)
    try {
      const res = await fetch('/api/me/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error('Failed to set role')
      // Force a reload so Clerk client picks up the new metadata
      window.location.href = role === 'teacher' ? '/teacher' : '/dashboard'
    } catch {
      setSubmitting(null)
      alert('Could not save your selection. Please try again.')
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-950 mb-3">
            Welcome to Revision City
          </h1>
          <p className="text-brand-600 text-lg">
            One quick question — how will you be using the app?
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Student card */}
          <button
            onClick={() => pickRole('student')}
            disabled={!!submitting}
            className="group bg-white rounded-2xl border-2 border-brand-200 p-8 text-left hover:border-brand-500 hover:shadow-xl transition-all disabled:opacity-50"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-950 mb-2">
              I'm a student
            </h2>
            <p className="text-sm text-brand-600 mb-4">
              Revising for IGCSEs. I want notes, flashcards, mock exams, and personalised study plans.
            </p>
            {submitting === 'student' ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:text-brand-900">
                Continue as student →
              </span>
            )}
          </button>

          {/* Teacher card */}
          <button
            onClick={() => pickRole('teacher')}
            disabled={!!submitting}
            className="group bg-white rounded-2xl border-2 border-brand-200 p-8 text-left hover:border-purple-500 hover:shadow-xl transition-all disabled:opacity-50"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-950 mb-2">
              I'm a teacher
            </h2>
            <p className="text-sm text-brand-600 mb-4">
              Teaching IGCSE students. I want to create classes, track student progress, and see where they need help.
            </p>
            {submitting === 'teacher' ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-purple-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-purple-700 group-hover:text-purple-900">
                Continue as teacher →
              </span>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-brand-400 mt-6">
          You can change this later in settings.
        </p>
      </div>
    </div>
  )
}
