import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

async function generateNotes(subtopic: any) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate comprehensive IGCSE ${subtopic.subject} revision notes for "${subtopic.name}" under topic "${subtopic.topic}".

Include:
- Key definitions (3-4 points)
- Important facts (3-4 points)
- Examples (2-3)
- Exam tips (1-2)

Format in markdown with ## headings and bullet points.`
      }]
    })

    return message.content[0].type === 'text' ? message.content[0].text : null
  } catch (error) {
    console.error(`Error generating notes:`, error)
    return null
  }
}

async function main() {
  console.log('🚀 Finding and filling gaps...\n')

  // Get ALL subtopics
  const { data: allSubtopics } = await supabase
    .from('subtopics')
    .select(`
      id,
      name,
      topics (
        name,
        subjects (name)
      )
    `)

  if (!allSubtopics) {
    console.log('No subtopics found')
    return
  }

  let filled = 0
  let skipped = 0

  // Check each one for missing notes
  for (const subtopic of allSubtopics) {
    const topic = (subtopic.topics as any)
    const subject = topic?.subjects

    if (!subject || !topic) {
      skipped++
      continue
    }

    // Check if notes exist
    const { data: existingNotes } = await supabase
      .from('notes')
      .select('id')
      .eq('subtopic_id', subtopic.id)
      .limit(1)

    if (existingNotes && existingNotes.length > 0) {
      skipped++
      continue
    }

    // MISSING NOTES - Generate them!
    console.log(`📝 [${filled + 1}] Generating: ${subject.name} > ${topic.name} > ${subtopic.name}`)

    const enriched = {
      ...subtopic,
      subject: subject.name,
      topic: topic.name
    }

    const notes = await generateNotes(enriched)

    if (notes) {
      await supabase.from('notes').insert({
        subtopic_id: subtopic.id,
        content: notes
      })
      filled++
      console.log(`  ✅ Added`)
    } else {
      console.log(`  ❌ Failed`)
    }

    // Small delay
    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\n✨ Done! Filled ${filled} gaps, skipped ${skipped} that already had content.`)
}

main().catch(console.error)
