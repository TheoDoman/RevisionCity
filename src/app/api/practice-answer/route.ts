import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: true }); // not signed in — skip silently

  try {
    const { question_id, user_answer, is_correct } = await request.json();

    if (!question_id || user_answer === undefined || is_correct === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await supabase.from('practice_question_results').insert({
      user_id: userId,
      question_id: String(question_id),
      user_answer: String(user_answer),
      is_correct: Boolean(is_correct),
      created_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical — don't surface to user
  }

  return NextResponse.json({ ok: true });
}
