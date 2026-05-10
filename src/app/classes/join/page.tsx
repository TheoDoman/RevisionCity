'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Users, Loader2, ArrowRight } from 'lucide-react'

export default function JoinClassPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const join = async () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) {
      setError('Class codes are 6 characters long.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not join class')
        return
      }
      router.push(`/teacher/classes/${data.classId}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-bold text-brand-950 mb-3">
            Sign in to join a class
          </h1>
          <p className="text-brand-600 mb-6">
            You need an account to join your teacher's class.
          </p>
          <Link href={`/sign-in?redirect_url=/classes/join`} className="btn-primary px-6 py-3 inline-block">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border-2 border-brand-100 p-8 max-w-md w-full shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mb-5 mx-auto">
          <Users className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-950 text-center mb-2">
          Join a class
        </h1>
        <p className="text-brand-600 text-center text-sm mb-6">
          Enter the 6-character code your teacher gave you.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null) }}
          maxLength={6}
          placeholder="ABC123"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter' && code.trim().length === 6) join() }}
          className="w-full px-4 py-4 rounded-xl border-2 border-brand-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-center font-mono text-2xl tracking-[0.5em] uppercase mb-4"
        />

        {error && (
          <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
        )}

        <button
          onClick={join}
          disabled={submitting || code.trim().length !== 6}
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              Join class
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-xs text-brand-400 text-center mt-5">
          Don't have a code? Ask your teacher.
        </p>
      </div>
    </div>
  )
}
