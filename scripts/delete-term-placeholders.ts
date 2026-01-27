import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🗑️  Deleting ALL Term 1/Term 2 placeholder content...\n')

  // Delete placeholder notes
  const { data: badNotes, error: notesError } = await supabase
    .from('notes')
    .delete()
    .or('content.ilike.%Term 1%,content.ilike.%Term 2%')
    .select()

  console.log(`Deleted ${badNotes?.length || 0} notes with Term placeholders`)

  // Delete placeholder practice questions
  const { data: badPractice, error: practiceError } = await supabase
    .from('practice_questions')
    .delete()
    .or('question.ilike.%Term 1%,question.ilike.%Term 2%,answer.ilike.%Term 1%,answer.ilike.%Term 2%')
    .select()

  console.log(`Deleted ${badPractice?.length || 0} practice questions with Term placeholders`)

  // Delete placeholder recall prompts
  const { data: badRecall, error: recallError } = await supabase
    .from('recall_prompts')
    .delete()
    .or('prompt.ilike.%Term 1%,prompt.ilike.%Term 2%,answer.ilike.%Term 1%,answer.ilike.%Term 2%')
    .select()

  console.log(`Deleted ${badRecall?.length || 0} recall prompts with Term placeholders`)

  // Delete placeholder flashcards
  const { data: badFlashcards, error: flashcardsError } = await supabase
    .from('flashcards')
    .delete()
    .or('front.ilike.%Term 1%,front.ilike.%Term 2%,back.ilike.%Term 1%,back.ilike.%Term 2%')
    .select()

  console.log(`Deleted ${badFlashcards?.length || 0} flashcards with Term placeholders`)

  console.log('\n✅ All Term 1/Term 2 placeholder content removed!')
}

main().catch(console.error)
