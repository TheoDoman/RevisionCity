import { NextRequest, NextResponse } from 'next/server'

// ── Sliding-window in-memory rate limiter ──────────────────────────────────
// NOTE: Resets on cold start (acceptable for basic serverless abuse protection).
// For distributed / persistent rate limiting, use Upstash Redis.

const store = new Map<string, number[]>()

/**
 * Check and record a request against a sliding-window rate limit.
 * @param key      - Unique key (e.g. `"anthropic:user_abc"`)
 * @param limit    - Max requests allowed in the window
 * @param windowMs - Window size in milliseconds (default: 60 000)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const prev = (store.get(key) ?? []).filter(t => now - t < windowMs)

  if (prev.length >= limit) {
    const retryAfter = Math.ceil((prev[0] + windowMs - now) / 1000)
    return { allowed: false, retryAfter }
  }

  prev.push(now)
  store.set(key, prev)
  return { allowed: true, retryAfter: 0 }
}

/** Extract the best-available client IP from a Next.js request. */
export function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

/** Build a standard 429 JSON response. */
export function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Please try again later.', retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}
