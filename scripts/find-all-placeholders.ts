import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('🔍 Finding ALL placeholder/bad content in database...\n')

  const badPatterns = [
    'placeholder',
    'lorem ipsum',
    'coming soon',
    'to be added',
    'TODO',
    'TBD',
    'example content',
    'sample content',
    'test content',
    'dummy',
    'Term 1',
    'Term 2'
  ]

  let totalIssues = 0

  // Check notes
  for (const pattern of badPatterns) {
    const { data: notes } = await supabase
      .from('notes')
      .select(`id, content, subtopics(name, topics(name, subjects(name)))`)
      .ilike('content', `%${pattern}%`)

    if (notes && notes.length > 0) {
      console.log(`\n❌ Found ${notes.length} NOTES with "${pattern}":`)
      notes.slice(0, 3).forEach((n: any) => {
        console.log(`  - ${n.subtopics.topics.subjects.name} > ${n.subtopics.topics.name} > ${n.subtopics.name}`)
      })
      totalIssues += notes.length
    }
  }

  // Check practice questions
  for (const pattern of badPatterns) {
    const { data: practice } = await supabase
      .from('practice_questions')
      .select(`id, question, subtopics(name, topics(name, subjects(name)))`)
      .or(`question.ilike.%${pattern}%,answer.ilike.%${pattern}%`)

    if (practice && practice.length > 0) {
      console.log(`\n❌ Found ${practice.length} PRACTICE QUESTIONS with "${pattern}":`)
      practice.slice(0, 3).forEach((p: any) => {
        console.log(`  - ${p.subtopics.topics.subjects.name} > ${p.subtopics.topics.name} > ${p.subtopics.name}`)
      })
      totalIssues += practice.length
    }
  }

  // Check recall prompts
  for (const pattern of badPatterns) {
    const { data: recall } = await supabase
      .from('recall_prompts')
      .select(`id, prompt, subtopics(name, topics(name, subjects(name)))`)
      .or(`prompt.ilike.%${pattern}%,answer.ilike.%${pattern}%`)

    if (recall && recall.length > 0) {
      console.log(`\n❌ Found ${recall.length} RECALL PROMPTS with "${pattern}":`)
      recall.slice(0, 3).forEach((r: any) => {
        console.log(`  - ${r.subtopics.topics.subjects.name} > ${r.subtopics.topics.name} > ${r.subtopics.name}`)
      })
      totalIssues += recall.length
    }
  }

  console.log(`\n\n📊 TOTAL PLACEHOLDER ITEMS: ${totalIssues}`)

  if (totalIssues === 0) {
    console.log('✅ Database is CLEAN!')
  } else {
    console.log('❌ CRITICAL: Placeholders found! Must fix before launch!')
  }
}

main().catch(console.error)
