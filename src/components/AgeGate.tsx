'use client'

import { useState } from 'react'

interface AgeGateProps {
  children: React.ReactNode
}

export function AgeGate({ children }: AgeGateProps) {
  const [checked, setChecked] = useState(false)
  const [passed, setPassed] = useState(false)

  if (passed) return <>{children}</>

  const proceed = () => {
    if (!checked) return
    // Store timestamp locally so AgeAcknowledgementSync can persist it to
    // Supabase once the user is authenticated after completing sign-up.
    localStorage.setItem('age_acknowledged_at', new Date().toISOString())
    setPassed(true)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-amber-400 text-brand-600
                       focus:ring-brand-500 cursor-pointer"
          />
          <span className="text-sm text-amber-900">
            I confirm I am at least 16 years old, or I have parental consent to use this service.
          </span>
        </label>
      </div>

      <button
        onClick={proceed}
        disabled={!checked}
        className="w-full py-3 px-4 bg-brand-600 text-white font-semibold rounded-xl
                   hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue to Sign Up
      </button>
    </div>
  )
}
