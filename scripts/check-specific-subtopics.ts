import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkSubtopic(subtopicName: string) {
  console.log(`\n🔍 Checking: ${subtopicName}`)
  console.log('='.repeat(60))

  const { data: subtopic } = await supabase
    .from('subtopics')
    .select('id, name')
    .ilike('name', `%${subtopicName}%`)
    .single()

  if (!subtopic) {
    console.log(`❌ Subtopic not found: ${subtopicName}`)
    return
  }

  // Check notes
  const { data: notes } = await supabase
    .from('notes')
    .select('id, content')
    .eq('subtopic_id', subtopic.id)

  console.log(`\n📝 Notes (${notes?.length || 0}):`)
  if (notes && notes.length > 0) {
    notes.forEach(note => {
      const preview = note.content?.substring(0, 150) || 'No content'
      console.log(`  - ${preview}${note.content?.length > 150 ? '...' : ''}`)
    })
  } else {
    console.log(`  ❌ NO NOTES FOUND`)
  }

  // Check practice
  const { data: practice } = await supabase
    .from('practice_questions')
    .select('id, question, answer')
    .eq('subtopic_id', subtopic.id)

  console.log(`\n❓ Practice Questions (${practice?.length || 0}):`)
  if (practice && practice.length > 0) {
    practice.slice(0, 2).forEach(q => {
      console.log(`  Q: ${q.question?.substring(0, 100)}...`)
      console.log(`  A: ${q.answer?.substring(0, 100)}...`)
    })
    if (practice.length > 2) console.log(`  ... and ${practice.length - 2} more`)
  } else {
    console.log(`  ❌ NO PRACTICE QUESTIONS FOUND`)
  }

  // Check recall
  const { data: recall } = await supabase
    .from('recall_prompts')
    .select('id, prompt, answer')
    .eq('subtopic_id', subtopic.id)

  console.log(`\n🧠 Recall Prompts (${recall?.length || 0}):`)
  if (recall && recall.length > 0) {
    recall.slice(0, 2).forEach(r => {
      console.log(`  P: ${r.prompt?.substring(0, 100)}...`)
      console.log(`  A: ${r.answer?.substring(0, 100)}...`)
    })
    if (recall.length > 2) console.log(`  ... and ${recall.length - 2} more`)
  } else {
    console.log(`  ❌ NO RECALL PROMPTS FOUND`)
  }
}

async function main() {
  const problematicSubtopics = [
    'Reflex actions',
    'Chromosomes',
    'Ecosystems',
    'Food chains',
    'Food webs'
  ]

  for (const subtopic of problematicSubtopics) {
    await checkSubtopic(subtopic)
  }
}

main().catch(console.error)
