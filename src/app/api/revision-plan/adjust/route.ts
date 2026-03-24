import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import type { WeekPlan } from '@/types'
import { rateLimit, tooManyRequests } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/revision-plan/adjust
// Triggered when user views their plan (max 1 adjust/day)
// Re-allocates next week's hours based on recent quiz performance
export async function POST(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Rate limiting: 30 req/min per user (general write route)
  const { allowed, retryAfter } = rateLimit(`general:${user.id}`, 30)
  if (!allowed) return tooManyRequests(retryAfter)

  let body: { planId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { planId } = body
  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 })

  // Fetch the plan
  const { data: plan, error: planError } = await supabase
    .from('revision_plans')
    .select('*')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  // Rate limit: 1 adjust per day
  if (plan.last_adjusted_at) {
    const lastAdjust = new Date(plan.last_adjusted_at)
    const hoursSince = (Date.now() - lastAdjust.getTime()) / (1000 * 60 * 60)
    if (hoursSince < 24) {
      return NextResponse.json({ adjusted: false, reason: 'Already adjusted today' })
    }
  }

  // Determine current week based on plan creation date
  const planStart = new Date(plan.created_at)
  const now = new Date()
  const weeksSinceStart = Math.floor((now.getTime() - planStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const currentWeekIndex = weeksSinceStart // 0-based
  const nextWeekIndex = currentWeekIndex + 1

  const weeks: WeekPlan[] = plan.weeks_data ?? []
  if (nextWeekIndex >= weeks.length) {
    return NextResponse.json({ adjusted: false, reason: 'Plan complete' })
  }

  // Fetch quiz scores from the past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentActivity } = await supabase
    .from('user_activity')
    .select('topic_id, score')
    .eq('user_id', user.id)
    .eq('subject_id', plan.subject_id)
    .eq('activity_type', 'quiz')
    .gte('created_at', sevenDaysAgo)
    .not('score', 'is', null)

  if (!recentActivity || recentActivity.length === 0) {
    return NextResponse.json({ adjusted: false, reason: 'No recent quiz data' })
  }

  // Build per-topic avg this week
  const weekScores: Record<string, number[]> = {}
  for (const row of recentActivity) {
    if (!row.topic_id) continue
    if (!weekScores[row.topic_id]) weekScores[row.topic_id] = []
    weekScores[row.topic_id].push(row.score)
  }

  const topicAvgs: Record<string, number> = {}
  for (const [id, scores] of Object.entries(weekScores)) {
    topicAvgs[id] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  // Adjust next week's allocations
  const nextWeek = { ...weeks[nextWeekIndex] }
  let totalHours = 0
  const adjusted = nextWeek.topicAllocations.map((alloc) => {
    const actualScore = topicAvgs[alloc.topicId]
    if (actualScore === undefined) return alloc

    let newHours = alloc.hours
    if (actualScore < 60) {
      // Underperforming — add 1-2 hrs
      newHours = Math.min(alloc.hours + 2, plan.hours_per_week)
      return { ...alloc, hours: newHours, priority: 'high' as const }
    } else if (actualScore > 85) {
      // Overperforming — reduce by 1 hr, unlock any postponed strong topic
      newHours = Math.max(1, alloc.hours - 1)
      return { ...alloc, hours: newHours, priority: 'low' as const }
    }
    return alloc
  })

  // Enforce hours cap
  totalHours = adjusted.reduce((a, b) => a + b.hours, 0)
  if (totalHours > plan.hours_per_week) {
    const excess = totalHours - plan.hours_per_week
    // Trim from low-priority topics first
    let remaining = excess
    for (let i = adjusted.length - 1; i >= 0 && remaining > 0; i--) {
      if (adjusted[i].priority === 'low' && adjusted[i].hours > 1) {
        const trim = Math.min(adjusted[i].hours - 1, remaining)
        adjusted[i] = { ...adjusted[i], hours: adjusted[i].hours - trim }
        remaining -= trim
      }
    }
  }

  nextWeek.topicAllocations = adjusted
  weeks[nextWeekIndex] = nextWeek

  const { error: updateError } = await supabase
    .from('revision_plans')
    .update({
      weeks_data: weeks,
      last_adjusted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save adjustment' }, { status: 500 })
  }

  return NextResponse.json({ adjusted: true, updatedWeeks: weeks })
}
