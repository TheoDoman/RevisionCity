import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

async function generateContent(subtopic: any, contentType: string) {
  const prompts: Record<string, string> = {
    notes: `Generate comprehensive IGCSE ${subtopic.subject} revision notes for "${subtopic.name}" under topic "${subtopic.topic}".

Include:
- Key definitions and concepts (4-5 points)
- Important details and facts (3-4 points)
- Examples or applications (2-3)
- Exam tips (1-2)

Format in markdown with ## headings and bullet points. Be thorough but concise.`,

    practice: `Generate 5 IGCSE ${subtopic.subject} exam-style practice questions for "${subtopic.name}".

Requirements:
- Mix of difficulty levels (2-6 marks each)
- Exam-realistic questions
- Clear mark schemes
- Test understanding, not just memory

Return ONLY a JSON array: [{"question": "...", "answer": "...", "marks": 3, "difficulty": 5}, ...]`,

    recall: `Generate 5 active recall prompts for IGCSE ${subtopic.subject} topic "${subtopic.name}".

Requirements:
- Test core concepts
- Require explanation
- Build understanding
- Not yes/no questions

Return ONLY a JSON array: [{"prompt": "...", "answer": "..."}, ...]`
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: prompts[contentType]
      }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    if (contentType === 'notes') {
      return text
    } else {
      // Extract JSON for practice/recall
      const jsonMatch = text.match(/\[[\s\S]*?\]/)
      if (!jsonMatch) {
        console.error(`Failed to extract JSON from ${contentType} response`)
        return null
      }
      try {
        return JSON.parse(jsonMatch[0])
      } catch {
        // Try cleaning the JSON
        const cleaned = jsonMatch[0]
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        return JSON.parse(cleaned)
      }
    }
  } catch (error) {
    console.error(`Error generating ${contentType}:`, error)
    return null
  }
}

async function main() {
  console.log('🚀 Generating missing content for ALL subtopics...\n')

  // Get all subtopics
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select(`
      id,
      name,
      topics (
        name,
        subjects (name)
      )
    `)

  if (!subtopics) {
    console.log('No subtopics found')
    return
  }

  let stats = {
    total: subtopics.length,
    notesGenerated: 0,
    practiceGenerated: 0,
    recallGenerated: 0,
    errors: 0
  }

  for (let i = 0; i < subtopics.length; i++) {
    const subtopic = subtopics[i]
    const topic = (subtopic.topics as any)
    const subject = topic?.subjects

    if (!subject || !topic) {
      console.log(`⚠️  Skipping ${subtopic.name} - missing relationships`)
      continue
    }

    const enrichedSubtopic = {
      ...subtopic,
      subject: subject.name,
      topic: topic.name
    }

    console.log(`\n[${i + 1}/${subtopics.length}] ${subject.name} > ${topic.name} > ${subtopic.name}`)

    // Check if notes exist
    const { data: existingNotes } = await supabase
      .from('notes')
      .select('id')
      .eq('subtopic_id', subtopic.id)
      .limit(1)

    if (!existingNotes || existingNotes.length === 0) {
      console.log('  📝 Generating notes...')
      const notes = await generateContent(enrichedSubtopic, 'notes')
      if (notes) {
        await supabase.from('notes').insert({
          subtopic_id: subtopic.id,
          content: notes
        })
        stats.notesGenerated++
        console.log('  ✅ Notes added')
      } else {
        console.log('  ❌ Failed to generate notes')
        stats.errors++
      }
      await new Promise(r => setTimeout(r, 1000))
    }

    // Check if practice questions exist
    const { data: existingPractice } = await supabase
      .from('practice_questions')
      .select('id')
      .eq('subtopic_id', subtopic.id)
      .limit(1)

    if (!existingPractice || existingPractice.length === 0) {
      console.log('  ❓ Generating practice questions...')
      const questions = await generateContent(enrichedSubtopic, 'practice')
      if (questions && Array.isArray(questions)) {
        for (const q of questions) {
          await supabase.from('practice_questions').insert({
            subtopic_id: subtopic.id,
            question: q.question,
            answer: q.answer,
            marks: q.marks || 3,
            difficulty: q.difficulty || 5
          })
        }
        stats.practiceGenerated++
        console.log(`  ✅ Added ${questions.length} practice questions`)
      } else {
        console.log('  ❌ Failed to generate practice questions')
        stats.errors++
      }
      await new Promise(r => setTimeout(r, 1000))
    }

    // Check if recall prompts exist
    const { data: existingRecall } = await supabase
      .from('recall_prompts')
      .select('id')
      .eq('subtopic_id', subtopic.id)
      .limit(1)

    if (!existingRecall || existingRecall.length === 0) {
      console.log('  🧠 Generating recall prompts...')
      const prompts = await generateContent(enrichedSubtopic, 'recall')
      if (prompts && Array.isArray(prompts)) {
        for (const p of prompts) {
          await supabase.from('recall_prompts').insert({
            subtopic_id: subtopic.id,
            prompt: p.prompt,
            answer: p.answer
          })
        }
        stats.recallGenerated++
        console.log(`  ✅ Added ${prompts.length} recall prompts`)
      } else {
        console.log('  ❌ Failed to generate recall prompts')
        stats.errors++
      }
      await new Promise(r => setTimeout(r, 1000))
    }
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('✨ CONTENT GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`📊 Total subtopics: ${stats.total}`)
  console.log(`📝 Notes generated: ${stats.notesGenerated}`)
  console.log(`❓ Practice sets generated: ${stats.practiceGenerated}`)
  console.log(`🧠 Recall sets generated: ${stats.recallGenerated}`)
  console.log(`❌ Errors: ${stats.errors}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
