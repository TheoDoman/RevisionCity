import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Count subtopics
  const { count: subtopicCount } = await supabase
    .from('subtopics')
    .select('*', { count: 'exact', head: true })

  // Count subtopics WITH notes
  const { count: notesCount } = await supabase
    .from('notes')
    .select('subtopic_id', { count: 'exact', head: true })

  // Count subtopics WITH practice
  const { count: practiceCount } = await supabase
    .from('practice_questions')
    .select('subtopic_id', { count: 'exact', head: true })

  // Count subtopics WITH recall
  const { count: recallCount } = await supabase
    .from('recall_prompts')
    .select('subtopic_id', { count: 'exact', head: true })

  console.log('\n📊 CONTENT COVERAGE:')
  console.log('='.repeat(50))
  console.log(`Total Subtopics: ${subtopicCount}`)
  console.log(`Subtopics with Notes: ${notesCount}`)
  console.log(`Subtopics with Practice: ${practiceCount}`)
  console.log(`Subtopics with Recall: ${recallCount}`)
  console.log('='.repeat(50))
  console.log(`\nNotes Coverage: ${notesCount}/${subtopicCount} (${Math.round((notesCount || 0) / (subtopicCount || 1) * 100)}%)`)
  console.log(`Practice Coverage: ${practiceCount}/${subtopicCount} (${Math.round((practiceCount || 0) / (subtopicCount || 1) * 100)}%)`)
  console.log(`Recall Coverage: ${recallCount}/${subtopicCount} (${Math.round((recallCount || 0) / (subtopicCount || 1) * 100)}%)\n`)
}

main().catch(console.error)
