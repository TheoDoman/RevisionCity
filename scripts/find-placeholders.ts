import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🔍 Scanning for placeholder content...\n')

  // Check notes
  const { data: notes } = await supabase
    .from('notes')
    .select(`
      id,
      content,
      subtopics (
        name,
        topics (
          name,
          subjects (name)
        )
      )
    `)
    .ilike('content', '%placeholder%')

  console.log(`\n📝 NOTES with placeholders: ${notes?.length || 0}`)
  if (notes && notes.length > 0) {
    notes.slice(0, 5).forEach((note: any) => {
      const subtopic = note.subtopics
      const topic = subtopic?.topics
      const subject = topic?.subjects
      console.log(`  - ${subject?.name} > ${topic?.name} > ${subtopic?.name}`)
    })
    if (notes.length > 5) console.log(`  ... and ${notes.length - 5} more`)
  }

  // Check practice questions
  const { data: practice } = await supabase
    .from('practice_questions')
    .select(`
      id,
      question,
      subtopics (
        name,
        topics (
          name,
          subjects (name)
        )
      )
    `)
    .ilike('question', '%placeholder%')

  console.log(`\n❓ PRACTICE QUESTIONS with placeholders: ${practice?.length || 0}`)
  if (practice && practice.length > 0) {
    practice.slice(0, 5).forEach((q: any) => {
      const subtopic = q.subtopics
      const topic = subtopic?.topics
      const subject = topic?.subjects
      console.log(`  - ${subject?.name} > ${topic?.name} > ${subtopic?.name}`)
    })
    if (practice.length > 5) console.log(`  ... and ${practice.length - 5} more`)
  }

  // Check recall prompts
  const { data: recall } = await supabase
    .from('recall_prompts')
    .select(`
      id,
      prompt,
      subtopics (
        name,
        topics (
          name,
          subjects (name)
        )
      )
    `)
    .ilike('prompt', '%placeholder%')

  console.log(`\n🧠 RECALL PROMPTS with placeholders: ${recall?.length || 0}`)
  if (recall && recall.length > 0) {
    recall.slice(0, 5).forEach((r: any) => {
      const subtopic = r.subtopics
      const topic = subtopic?.topics
      const subject = topic?.subjects
      console.log(`  - ${subject?.name} > ${topic?.name} > ${subtopic?.name}`)
    })
    if (recall.length > 5) console.log(`  ... and ${recall.length - 5} more`)
  }

  console.log(`\n\n📊 TOTAL PLACEHOLDERS: ${(notes?.length || 0) + (practice?.length || 0) + (recall?.length || 0)}`)
}

main().catch(console.error)
