'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
    // Reload so analytics scripts initialise now that consent is granted
    window.location.reload()
  }

  const reject = () => {
    localStorage.setItem('cookie_consent', 'rejected')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-brand-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-brand-700 flex-1">
          We use essential cookies for authentication and site functionality, and optional analytics
          cookies to help us improve your experience.{' '}
          <Link href="/privacy" className="underline hover:text-brand-900 transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm font-medium text-brand-600 border border-brand-300
                       rounded-lg hover:bg-brand-50 transition-colors"
          >
            Reject non-essential
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg
                       hover:bg-brand-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
