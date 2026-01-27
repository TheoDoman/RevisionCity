'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="font-display text-3xl font-bold text-brand-950 mb-4">
          Something went wrong!
        </h2>
        <p className="text-brand-600 mb-6">
          Don't worry, we're on it. Try refreshing the page.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary px-6 py-3"
          >
            Try again
          </button>
          <Link href="/" className="btn-secondary px-6 py-3">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
