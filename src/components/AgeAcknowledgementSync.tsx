'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

/**
 * Runs once after sign-up: reads the age_acknowledged_at timestamp stored
 * in localStorage by AgeGate and persists it to Supabase via an API route.
 * Clears the localStorage entry after a successful sync.
 */
export function AgeAcknowledgementSync() {
  const { isSignedIn } = useUser()

  useEffect(() => {
    if (!isSignedIn) return

    const acknowledgedAt = localStorage.getItem('age_acknowledged_at')
    if (!acknowledgedAt) return

    fetch('/api/auth/acknowledge-age', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgedAt }),
    })
      .then(res => {
        if (res.ok) localStorage.removeItem('age_acknowledged_at')
      })
      .catch(() => {
        // Non-critical — will retry on next page load
      })
  }, [isSignedIn])

  return null
}
