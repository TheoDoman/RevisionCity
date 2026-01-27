import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Check if content is placeholder
function isPlaceholder(text: string): boolean {
  if (!text) return false
  const lowerText = text.toLowerCase()
  return lowerText.includes('placeholder') ||
         lowerText.includes('lorem ipsum') ||
         lowerText.includes('[to be added]') ||
         lowerText.includes('coming soon') ||
         text.trim().length < 50 // Suspiciously short content
}

async function generateRealContent(subtopic: any, method: string, subject: string, topic: string) {
  const prompts: Record<string, string> = {
    notes: `Generate comprehensive IGCSE ${subject} revision notes for the subtopic "${subtopic.name}" under topic "${topic}".

Include:
- Key concepts and definitions
- Important facts and details
- Examples and applications
- Exam tips

Return ONLY a JSON object with a "content" field containing the notes in markdown format.`,

    practice: `Generate 5 IGCSE ${subject} practice questions for subtopic "${subtopic.name}" under topic "${topic}".

Each question should:
- Test understanding
- Include mark allocation
- Have detailed answer/mark scheme

Return ONLY a JSON array of objects with fields: question, answer, marks, difficulty.`,

    recall: `Generate 5 active recall prompts for IGCSE ${subject} subtopic "${subtopic.name}" under topic "${topic}".

Prompts should:
- Test key concepts
- Require explanation, not just memory
- Build understanding

Return ONLY a JSON array of objects with fields: prompt, answer.`
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompts[method]
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('Failed to extract JSON from response')
      return null
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error(`Error generating ${method}:`, error)
    return null
  }
}

async function main() {
  console.log('🔍 Finding all placeholder content...\n')

  // Get all subtopics with their relationships
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select(`
      id,
      name,
      slug,
      topics (
        id,
        name,
        subjects (
          id,
          name
        )
      )
    `)

  if (!subtopics) {
    console.log('No subtopics found')
    return
  }

  let fixed = 0
  let total = 0

  for (const subtopic of subtopics) {
    const topic = (subtopic.topics as any)
    const subject = topic?.subjects

    if (!subject || !topic) continue

    console.log(`\n📚 Checking: ${subject.name} > ${topic.name} > ${subtopic.name}`)

    // Check notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('subtopic_id', subtopic.id)

    if (notes && notes.length > 0) {
      for (const note of notes) {
        if (isPlaceholder(note.content)) {
          total++
          console.log(`  ⚠️  Found placeholder in notes`)

          const newContent = await generateRealContent(subtopic, 'notes', subject.name, topic.name)
          if (newContent && newContent.content) {
            await supabase
              .from('notes')
              .update({ content: newContent.content })
              .eq('id', note.id)
            fixed++
            console.log(`  ✅ Fixed notes`)
          }
        }
      }
    }

    // Check practice questions
    const { data: practice } = await supabase
      .from('practice_questions')
      .select('*')
      .eq('subtopic_id', subtopic.id)

    if (practice && practice.length > 0) {
      for (const q of practice) {
        if (isPlaceholder(q.question) || isPlaceholder(q.answer)) {
          total++
          console.log(`  ⚠️  Found placeholder in practice questions`)

          const newQuestions = await generateRealContent(subtopic, 'practice', subject.name, topic.name)
          if (newQuestions && Array.isArray(newQuestions)) {
            // Delete old placeholder questions
            await supabase
              .from('practice_questions')
              .delete()
              .eq('subtopic_id', subtopic.id)

            // Insert new ones
            for (const nq of newQuestions) {
              await supabase
                .from('practice_questions')
                .insert({
                  subtopic_id: subtopic.id,
                  question: nq.question,
                  answer: nq.answer,
                  marks: nq.marks || 3,
                  difficulty: nq.difficulty || 5
                })
            }
            fixed++
            console.log(`  ✅ Fixed practice questions`)
          }
        }
      }
    }

    // Check recall prompts
    const { data: recall } = await supabase
      .from('recall_prompts')
      .select('*')
      .eq('subtopic_id', subtopic.id)

    if (recall && recall.length > 0) {
      for (const r of recall) {
        if (isPlaceholder(r.prompt) || isPlaceholder(r.answer)) {
          total++
          console.log(`  ⚠️  Found placeholder in recall prompts`)

          const newPrompts = await generateRealContent(subtopic, 'recall', subject.name, topic.name)
          if (newPrompts && Array.isArray(newPrompts)) {
            // Delete old placeholder prompts
            await supabase
              .from('recall_prompts')
              .delete()
              .eq('subtopic_id', subtopic.id)

            // Insert new ones
            for (const np of newPrompts) {
              await supabase
                .from('recall_prompts')
                .insert({
                  subtopic_id: subtopic.id,
                  prompt: np.prompt,
                  answer: np.answer
                })
            }
            fixed++
            console.log(`  ✅ Fixed recall prompts`)
          }
        }
      }
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log(`\n\n✨ Complete!`)
  console.log(`📊 Found ${total} placeholder items`)
  console.log(`✅ Fixed ${fixed} items`)
  console.log(`❌ Failed ${total - fixed} items\n`)
}

main().catch(console.error)
