import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Check flashcard_sets structure
  const { data: fsets } = await supabase.from('flashcard_sets').select('*').limit(2)
  console.log('flashcard_sets sample:', JSON.stringify(fsets?.[0], null, 2))
  
  const { data: flashcards } = await supabase.from('flashcards').select('*').limit(2)
  console.log('\nflashcards sample:', JSON.stringify(flashcards?.[0], null, 2))
  
  const { data: quizzes } = await supabase.from('quizzes').select('*').limit(2)
  console.log('\nquizzes sample:', JSON.stringify(quizzes?.[0], null, 2))
  
  const { data: quizQs } = await supabase.from('quiz_questions').select('*').limit(2)
  console.log('\nquiz_questions sample:', JSON.stringify(quizQs?.[0], null, 2))
  
  const { data: practice } = await supabase.from('practice_questions').select('*').limit(2)
  console.log('\npractice_questions sample:', JSON.stringify(practice?.[0], null, 2))
  
  const { data: recall } = await supabase.from('recall_prompts').select('*').limit(2)
  console.log('\nrecall_prompts sample:', JSON.stringify(recall?.[0], null, 2))
  
  const { data: notes } = await supabase.from('notes').select('*').limit(1)
  console.log('\nnotes sample keys:', Object.keys(notes?.[0] || {}))
  
  // Count flashcard sets
  const { count: fsetCount } = await supabase.from('flashcard_sets').select('*', { count: 'exact', head: true })
  const { count: fcCount } = await supabase.from('flashcards').select('*', { count: 'exact', head: true })
  const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true })
  const { count: qqCount } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true })
  console.log('\nTotal flashcard_sets:', fsetCount)
  console.log('Total flashcards:', fcCount)
  console.log('Total quizzes:', quizCount)
  console.log('Total quiz_questions:', qqCount)
}

main().catch(console.error)
