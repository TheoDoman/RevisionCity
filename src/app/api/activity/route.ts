import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getIP, tooManyRequests } from '@/lib/rate-limit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  // Not authenticated — skip silently (don't break the study flow)
  if (!userId) return NextResponse.json({ ok: true });

  // Rate limiting: 30 req/min per user (general write route)
  const { allowed, retryAfter } = rateLimit(`general:${userId}`, 30)
  if (!allowed) return tooManyRequests(retryAfter);

  try {
    const { activity_type, subject_id, topic_id, subtopic_id, score } = await request.json();

    await supabase.from('user_activity').insert({
      user_id: userId,
      activity_type,
      subject_id,
      topic_id,
      subtopic_id,
      score: score ?? null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical — don't surface to user
  }

  return NextResponse.json({ ok: true });
}
