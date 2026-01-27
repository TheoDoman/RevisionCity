import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🔍 Finding and removing duplicate content...\n')

  let totalRemoved = 0

  // Find duplicate flashcards
  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('*')
    .order('created_at')

  if (flashcards) {
    const seen = new Map<string, string>()
    const toDelete: string[] = []

    flashcards.forEach(card => {
      const key = `${card.front}|${card.back}`.toLowerCase().trim()
      if (seen.has(key)) {
        toDelete.push(card.id)
      } else {
        seen.set(key, card.id)
      }
    })

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .in('id', toDelete)

      console.log(`🗑️  Removed ${toDelete.length} duplicate flashcards`)
      totalRemoved += toDelete.length
    } else {
      console.log('✅ No duplicate flashcards found')
    }
  }

  // Find duplicate practice questions
  const { data: practice } = await supabase
    .from('practice_questions')
    .select('*')
    .order('created_at')

  if (practice) {
    const seen = new Map<string, string>()
    const toDelete: string[] = []

    practice.forEach(q => {
      const key = q.question.toLowerCase().trim()
      if (seen.has(key)) {
        toDelete.push(q.id)
      } else {
        seen.set(key, q.id)
      }
    })

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from('practice_questions')
        .delete()
        .in('id', toDelete)

      console.log(`🗑️  Removed ${toDelete.length} duplicate practice questions`)
      totalRemoved += toDelete.length
    } else {
      console.log('✅ No duplicate practice questions found')
    }
  }

  // Find duplicate recall prompts
  const { data: recall } = await supabase
    .from('recall_prompts')
    .select('*')
    .order('created_at')

  if (recall) {
    const seen = new Map<string, string>()
    const toDelete: string[] = []

    recall.forEach(r => {
      const key = r.prompt.toLowerCase().trim()
      if (seen.has(key)) {
        toDelete.push(r.id)
      } else {
        seen.set(key, r.id)
      }
    })

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from('recall_prompts')
        .delete()
        .in('id', toDelete)

      console.log(`🗑️  Removed ${toDelete.length} duplicate recall prompts`)
      totalRemoved += toDelete.length
    } else {
      console.log('✅ No duplicate recall prompts found')
    }
  }

  // Find duplicate quiz questions
  const { data: quiz } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('created_at')

  if (quiz) {
    const seen = new Map<string, string>()
    const toDelete: string[] = []

    quiz.forEach(q => {
      const key = q.question.toLowerCase().trim()
      if (seen.has(key)) {
        toDelete.push(q.id)
      } else {
        seen.set(key, q.id)
      }
    })

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .in('id', toDelete)

      console.log(`🗑️  Removed ${toDelete.length} duplicate quiz questions`)
      totalRemoved += toDelete.length
    } else {
      console.log('✅ No duplicate quiz questions found')
    }
  }

  console.log(`\n✨ Done! Removed ${totalRemoved} total duplicates`)
}

main().catch(console.error)
