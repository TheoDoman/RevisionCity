import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Sample 20 random subtopics to check their content
    const { data: subtopics } = await supabase
      .from('subtopics')
      .select('id, name, topics(name, subjects(name))')
      .limit(20)

    const contentStats = {
      subtopicsChecked: 0,
      withNotes: 0,
      withFlashcards: 0,
      withQuizzes: 0,
      withPractice: 0,
      withRecall: 0,
      completelyEmpty: 0,
      samples: [] as any[]
    }

    for (const subtopic of subtopics || []) {
      contentStats.subtopicsChecked++

      const { data: notes } = await supabase
        .from('notes')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const { data: flashcards } = await supabase
        .from('flashcards')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const { data: quizzes } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const { data: practice } = await supabase
        .from('practice_questions')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const { data: recall } = await supabase
        .from('recall_prompts')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const hasNotes = notes && notes.length > 0
      const hasFlashcards = flashcards && flashcards.length > 0
      const hasQuizzes = quizzes && quizzes.length > 0
      const hasPractice = practice && practice.length > 0
      const hasRecall = recall && recall.length > 0

      if (hasNotes) contentStats.withNotes++
      if (hasFlashcards) contentStats.withFlashcards++
      if (hasQuizzes) contentStats.withQuizzes++
      if (hasPractice) contentStats.withPractice++
      if (hasRecall) contentStats.withRecall++

      if (!hasNotes && !hasFlashcards && !hasQuizzes && !hasPractice && !hasRecall) {
        contentStats.completelyEmpty++
      }

      contentStats.samples.push({
        name: subtopic.name,
        path: `${(subtopic.topics as any)?.subjects?.name} > ${(subtopic.topics as any)?.name} > ${subtopic.name}`,
        hasNotes,
        hasFlashcards,
        hasQuizzes,
        hasPractice,
        hasRecall
      })
    }

    return NextResponse.json({
      success: true,
      stats: contentStats
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to check content' },
      { status: 500 }
    )
  }
}
