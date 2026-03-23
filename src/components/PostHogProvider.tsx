'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialise PostHog after the user has accepted analytics cookies
    if (localStorage.getItem('cookie_consent') !== 'accepted') return

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

    if (!key) {
      console.log('[PostHog] No API key configured, skipping initialization')
      return
    }

    posthog.init(key, {
      api_host: host,
      person_profiles: 'identified_only',
      capture_pageview: false, // We handle this manually for SPA route changes
      capture_pageleave: true,
      autocapture: true, // Captures every click, input change, form submit automatically
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}

/**
 * Component that tracks page views on route changes in Next.js App Router.
 * Must be placed inside PostHogProvider.
 */
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = url + '?' + searchParams.toString()
      }
      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams])

  return null
}
