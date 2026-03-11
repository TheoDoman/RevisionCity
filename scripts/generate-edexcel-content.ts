/**
 * generate-edexcel-content.ts
 *
 * Generates all study materials for Edexcel IGCSE subjects in the database.
 * Run AFTER executing generate-edexcel-structure.sql against Supabase.
 *
 * Per subtopic:  notes, 7 flashcards, 7 quiz questions, 3 practice questions, 4 recall prompts
 * Per topic:     1 mind map, 1 summary sheet
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... NEXT_PUBLIC_SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/generate-edexcel-content.ts
 *
 * Optional: pass a subject slug to only process one subject:
 *   ... npx tsx scripts/generate-edexcel-content.ts mathematics
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const MODEL = 'claude-opus-4-6'
const DELAY_MS = 1200 // throttle between API calls

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractJson(text: string): unknown | null {
  const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    const cleaned = match[0]
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/,(\s*[}\]])/g, '$1')
    try {
      return JSON.parse(cleaned)
    } catch {
      return null
    }
  }
}

async function callClaude(prompt: string, maxTokens = 3000): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  return message.content[0].type === 'text' ? message.content[0].text : ''
}

// ─── Content generators ────────────────────────────────────────────────────────

async function generateNotes(sub: SubtopicRow): Promise<string | null> {
  const prompt = `You are an expert Edexcel IGCSE ${sub.subject} teacher writing revision notes for students.

Write comprehensive revision notes for the subtopic: "${sub.name}"
Topic: ${sub.topic}
Subject: Edexcel IGCSE ${sub.subject}

Requirements:
- Cover all key definitions and terminology (4–6 items)
- Explain the main concepts clearly (4–6 points)
- Include worked examples or real-world applications (2–3)
- Add 2 exam technique tips specific to Edexcel mark schemes
- Use Edexcel IGCSE specification ${sub.subject} language and style
- Do NOT repeat content from other subtopics — focus only on "${sub.name}"

Format in clean markdown with ## section headings and bullet points.`

  try {
    const text = await callClaude(prompt, 3000)
    return text || null
  } catch (e) {
    console.error('  ❌ Notes error:', e)
    return null
  }
}

async function generateFlashcards(sub: SubtopicRow): Promise<FlashcardItem[] | null> {
  const prompt = `You are an expert Edexcel IGCSE ${sub.subject} teacher.

Generate exactly 7 flashcards for: "${sub.name}" (${sub.topic} — Edexcel IGCSE ${sub.subject})

Rules:
- Each card tests a single, specific concept
- Fronts are questions (not "What is X?") — use "Define...", "State...", "Explain...", "Calculate...", "Describe..." etc.
- Backs are concise, exam-accurate answers using Edexcel mark scheme language
- Cover different aspects of the subtopic — no repetition
- Difficulty should range from straightforward recall to application

Return ONLY valid JSON (no extra text):
[
  { "front": "...", "back": "..." },
  ...7 items total
]`

  try {
    const text = await callClaude(prompt, 2000)
    const data = extractJson(text)
    if (Array.isArray(data) && data.length > 0) return data as FlashcardItem[]
    return null
  } catch (e) {
    console.error('  ❌ Flashcards error:', e)
    return null
  }
}

async function generateQuizQuestions(sub: SubtopicRow): Promise<QuizItem[] | null> {
  const prompt = `You are an expert Edexcel IGCSE ${sub.subject} teacher.

Generate exactly 7 multiple-choice quiz questions for: "${sub.name}" (${sub.topic} — Edexcel IGCSE ${sub.subject})

Rules:
- Each question has exactly 4 options (A, B, C, D)
- One clearly correct answer; distractors are plausible but wrong
- Questions range from recall to application (mix difficulty 2–8 out of 10)
- Use Edexcel IGCSE specification language
- No question should overlap with another

Return ONLY valid JSON (no extra text):
[
  {
    "question": "...",
    "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
    "correct_answer": "A",
    "explanation": "Brief explanation of why the answer is correct.",
    "difficulty": 5
  },
  ...7 items total
]`

  try {
    const text = await callClaude(prompt, 2500)
    const data = extractJson(text)
    if (Array.isArray(data) && data.length > 0) return data as QuizItem[]
    return null
  } catch (e) {
    console.error('  ❌ Quiz error:', e)
    return null
  }
}

async function generatePracticeQuestions(sub: SubtopicRow): Promise<PracticeItem[] | null> {
  const prompt = `You are an expert Edexcel IGCSE ${sub.subject} examiner.

Write exactly 3 exam-style practice questions for: "${sub.name}" (${sub.topic} — Edexcel IGCSE ${sub.subject})

Rules:
- Model the style and language of real Edexcel IGCSE ${sub.subject} exam papers
- Mix of marks: one 2-mark, one 4-mark, one 6-mark question
- Include mark schemes that match Edexcel marking conventions (each point = 1 mark)
- Questions should test understanding, not just recall
- Difficulty levels: accessible (2m), intermediate (4m), challenging (6m)

Return ONLY valid JSON (no extra text):
[
  {
    "question": "Full question text, including any context or data needed.",
    "answer": "Mark scheme: point 1 (1); point 2 (1); ...",
    "marks": 2,
    "difficulty": 4
  },
  ...3 items total
]`

  try {
    const text = await callClaude(prompt, 2000)
    const data = extractJson(text)
    if (Array.isArray(data) && data.length > 0) return data as PracticeItem[]
    return null
  } catch (e) {
    console.error('  ❌ Practice error:', e)
    return null
  }
}

async function generateRecallPrompts(sub: SubtopicRow): Promise<RecallItem[] | null> {
  const prompt = `You are an expert Edexcel IGCSE ${sub.subject} teacher.

Generate exactly 4 active recall prompts for: "${sub.name}" (${sub.topic} — Edexcel IGCSE ${sub.subject})

Rules:
- Each prompt is an open-ended question that forces deep thinking
- Answers should require a 2–4 sentence explanation (not just a word or number)
- Prompts should NOT be yes/no questions
- Use "Explain...", "Describe...", "Why...", "How...", "Compare..." starters
- Answers use Edexcel mark scheme language and are concise but complete

Return ONLY valid JSON (no extra text):
[
  { "prompt": "...", "answer": "..." },
  ...4 items total
]`

  try {
    const text = await callClaude(prompt, 1800)
    const data = extractJson(text)
    if (Array.isArray(data) && data.length > 0) return data as RecallItem[]
    return null
  } catch (e) {
    console.error('  ❌ Recall error:', e)
    return null
  }
}

async function generateMindMap(topic: TopicRow, subtopics: SubtopicRow[]): Promise<object | null> {
  const subtopicList = subtopics.map(s => `- ${s.name}: ${s.description}`).join('\n')
  const prompt = `You are an expert Edexcel IGCSE ${topic.subject} teacher.

Create a mind map structure for the topic: "${topic.name}" (Edexcel IGCSE ${topic.subject})

Subtopics covered:
${subtopicList}

Rules:
- Central node = topic name
- First-level branches = the 6 subtopics
- Each subtopic branch should have 3–4 key concept leaf nodes
- Leaf nodes are concise (3–6 words each)

Return ONLY valid JSON (no extra text):
{
  "central": "${topic.name}",
  "branches": [
    {
      "label": "Subtopic name",
      "nodes": ["key concept 1", "key concept 2", "key concept 3"]
    }
  ]
}`

  try {
    const text = await callClaude(prompt, 1500)
    const data = extractJson(text)
    if (data && typeof data === 'object') return data as object
    return null
  } catch (e) {
    console.error('  ❌ Mind map error:', e)
    return null
  }
}

async function generateSummarySheet(topic: TopicRow, subtopics: SubtopicRow[]): Promise<string | null> {
  const subtopicList = subtopics.map(s => `- ${s.name}`).join('\n')
  const prompt = `You are an expert Edexcel IGCSE ${topic.subject} teacher writing a one-page summary sheet.

Write a concise summary sheet for the topic: "${topic.name}" (Edexcel IGCSE ${topic.subject})

Subtopics to cover:
${subtopicList}

Requirements:
- One paragraph per subtopic (4–5 sentences each)
- Include the most important facts, definitions and relationships
- Highlight 2–3 common exam mistakes per subtopic
- End with a "Key Equations / Key Terms" section listing the most important items
- Use Edexcel IGCSE language and notation throughout
- Format in clean markdown

Keep it concise — this is a revision summary, not full notes.`

  try {
    const text = await callClaude(prompt, 3500)
    return text || null
  } catch (e) {
    console.error('  ❌ Summary sheet error:', e)
    return null
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubtopicRow {
  id: string
  name: string
  description: string
  topic_id: string
  topic: string
  subject: string
  subject_id: string
}

interface TopicRow {
  id: string
  name: string
  subject: string
  subject_id: string
  subtopics: SubtopicRow[]
}

interface FlashcardItem { front: string; back: string }
interface QuizItem { question: string; options: string[]; correct_answer: string; explanation: string; difficulty: number }
interface PracticeItem { question: string; answer: string; marks: number; difficulty: number }
interface RecallItem { prompt: string; answer: string }

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function hasContent(table: string, field: string, id: string): Promise<boolean> {
  const { data } = await supabase.from(table).select('id').eq(field, id).limit(1)
  return (data?.length ?? 0) > 0
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const filterSlug = process.argv[2] || null

  console.log('='.repeat(65))
  console.log('  Edexcel IGCSE Content Generator')
  console.log('='.repeat(65))
  if (filterSlug) console.log(`  Filtering to subject: ${filterSlug}\n`)

  // Fetch Edexcel subjects
  let subjectQuery = supabase
    .from('subjects')
    .select('id, name, slug')
    .eq('exam_board', 'edexcel')
    .order('name')

  if (filterSlug) subjectQuery = subjectQuery.eq('slug', filterSlug)

  const { data: subjects, error: subErr } = await subjectQuery
  if (subErr || !subjects?.length) {
    console.error('❌ No Edexcel subjects found. Have you run generate-edexcel-structure.sql?')
    process.exit(1)
  }

  console.log(`Found ${subjects.length} Edexcel subject(s)\n`)

  const stats = {
    subtopicsProcessed: 0,
    notesAdded: 0,
    flashcardsAdded: 0,
    quizAdded: 0,
    practiceAdded: 0,
    recallAdded: 0,
    mindMapsAdded: 0,
    summarySheets: 0,
    errors: 0,
  }

  for (const subject of subjects) {
    console.log(`\n${'─'.repeat(65)}`)
    console.log(`📚  ${subject.name} (Edexcel IGCSE)`)
    console.log('─'.repeat(65))

    // Fetch topics for this subject
    const { data: topics } = await supabase
      .from('topics')
      .select('id, name')
      .eq('subject_id', subject.id)
      .order('order_index')

    if (!topics?.length) {
      console.log('  ⚠️  No topics found — skipping')
      continue
    }

    for (const topic of topics) {
      console.log(`\n  📖  Topic: ${topic.name}`)

      // Fetch subtopics for this topic
      const { data: subtopicRows } = await supabase
        .from('subtopics')
        .select('id, name, description, topic_id')
        .eq('topic_id', topic.id)
        .order('order_index')

      if (!subtopicRows?.length) {
        console.log('    ⚠️  No subtopics found — skipping')
        continue
      }

      const subtopics: SubtopicRow[] = subtopicRows.map(s => ({
        ...s,
        topic: topic.name,
        subject: subject.name,
        subject_id: subject.id,
      }))

      const topicRow: TopicRow = {
        id: topic.id,
        name: topic.name,
        subject: subject.name,
        subject_id: subject.id,
        subtopics,
      }

      // ── Per-subtopic content ──────────────────────────────────────────────
      for (let i = 0; i < subtopics.length; i++) {
        const sub = subtopics[i]
        console.log(`\n    [${i + 1}/${subtopics.length}] ${sub.name}`)
        stats.subtopicsProcessed++

        // Notes
        if (!(await hasContent('notes', 'subtopic_id', sub.id))) {
          process.stdout.write('      📝 notes... ')
          const notes = await generateNotes(sub)
          if (notes) {
            const { error } = await supabase.from('notes').insert({ subtopic_id: sub.id, content: notes })
            if (!error) { stats.notesAdded++; console.log('✅') } else { stats.errors++; console.log('❌ DB:', error.message) }
          } else { stats.errors++; console.log('❌ generate failed') }
          await sleep(DELAY_MS)
        } else { console.log('      📝 notes... ⏭️  exists') }

        // Flashcards
        if (!(await hasContent('flashcards', 'subtopic_id', sub.id))) {
          process.stdout.write('      🃏 flashcards (7)... ')
          const cards = await generateFlashcards(sub)
          if (cards && cards.length > 0) {
            const rows = cards.map(c => ({ subtopic_id: sub.id, front: c.front, back: c.back }))
            const { error } = await supabase.from('flashcards').insert(rows)
            if (!error) { stats.flashcardsAdded++; console.log('✅') } else { stats.errors++; console.log('❌ DB:', error.message) }
          } else { stats.errors++; console.log('❌ generate failed') }
          await sleep(DELAY_MS)
        } else { console.log('      🃏 flashcards... ⏭️  exists') }

        // Quiz questions
        if (!(await hasContent('quiz_questions', 'subtopic_id', sub.id))) {
          process.stdout.write('      🧩 quiz (7)... ')
          const quiz = await generateQuizQuestions(sub)
          if (quiz && quiz.length > 0) {
            const rows = quiz.map(q => ({
              subtopic_id: sub.id,
              question: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
              explanation: q.explanation,
              difficulty: q.difficulty ?? 5,
            }))
            const { error } = await supabase.from('quiz_questions').insert(rows)
            if (!error) { stats.quizAdded++; console.log('✅') } else { stats.errors++; console.log('❌ DB:', error.message) }
          } else { stats.errors++; console.log('❌ generate failed') }
          await sleep(DELAY_MS)
        } else { console.log('      🧩 quiz... ⏭️  exists') }

        // Practice questions
        if (!(await hasContent('practice_questions', 'subtopic_id', sub.id))) {
          process.stdout.write('      ❓ practice (3)... ')
          const practice = await generatePracticeQuestions(sub)
          if (practice && practice.length > 0) {
            const rows = practice.map(p => ({
              subtopic_id: sub.id,
              question: p.question,
              answer: p.answer,
              marks: p.marks ?? 3,
              difficulty: p.difficulty ?? 5,
            }))
            const { error } = await supabase.from('practice_questions').insert(rows)
            if (!error) { stats.practiceAdded++; console.log('✅') } else { stats.errors++; console.log('❌ DB:', error.message) }
          } else { stats.errors++; console.log('❌ generate failed') }
          await sleep(DELAY_MS)
        } else { console.log('      ❓ practice... ⏭️  exists') }

        // Recall prompts
        if (!(await hasContent('recall_prompts', 'subtopic_id', sub.id))) {
          process.stdout.write('      🧠 recall (4)... ')
          const recall = await generateRecallPrompts(sub)
          if (recall && recall.length > 0) {
            const rows = recall.map(r => ({ subtopic_id: sub.id, prompt: r.prompt, answer: r.answer }))
            const { error } = await supabase.from('recall_prompts').insert(rows)
            if (!error) { stats.recallAdded++; console.log('✅') } else { stats.errors++; console.log('❌ DB:', error.message) }
          } else { stats.errors++; console.log('❌ generate failed') }
          await sleep(DELAY_MS)
        } else { console.log('      🧠 recall... ⏭️  exists') }
      }

      // ── Per-topic content ─────────────────────────────────────────────────

      // Mind map
      if (!(await hasContent('mind_maps', 'topic_id', topic.id))) {
        process.stdout.write(`\n    🗺️  Mind map for "${topic.name}"... `)
        const mm = await generateMindMap(topicRow, subtopics)
        if (mm) {
          const { error } = await supabase.from('mind_maps').insert({ topic_id: topic.id, content: mm })
          if (!error) { stats.mindMapsAdded++; console.log('✅') } else { stats.errors++; console.log('❌ DB:', error.message) }
        } else { stats.errors++; console.log('❌ generate failed') }
        await sleep(DELAY_MS)
      } else { console.log(`\n    🗺️  Mind map... ⏭️  exists`) }

      // Summary sheet
      if (!(await hasContent('summary_sheets', 'topic_id', topic.id))) {
        process.stdout.write(`    📄  Summary sheet for "${topic.name}"... `)
        const ss = await generateSummarySheet(topicRow, subtopics)
        if (ss) {
          const { error } = await supabase.from('summary_sheets').insert({ topic_id: topic.id, content: ss })
          if (!error) { stats.summarySheets++; console.log('✅') } else { stats.errors++; console.log('❌ DB:', error.message) }
        } else { stats.errors++; console.log('❌ generate failed') }
        await sleep(DELAY_MS)
      } else { console.log(`    📄  Summary sheet... ⏭️  exists`) }
    }
  }

  console.log('\n\n' + '='.repeat(65))
  console.log('  CONTENT GENERATION COMPLETE')
  console.log('='.repeat(65))
  console.log(`  Subtopics processed : ${stats.subtopicsProcessed}`)
  console.log(`  Notes added         : ${stats.notesAdded}`)
  console.log(`  Flashcard sets      : ${stats.flashcardsAdded}  (× 7 = ${stats.flashcardsAdded * 7} cards)`)
  console.log(`  Quiz sets           : ${stats.quizAdded}  (× 7 = ${stats.quizAdded * 7} questions)`)
  console.log(`  Practice sets       : ${stats.practiceAdded}  (× 3 = ${stats.practiceAdded * 3} questions)`)
  console.log(`  Recall sets         : ${stats.recallAdded}  (× 4 = ${stats.recallAdded * 4} prompts)`)
  console.log(`  Mind maps           : ${stats.mindMapsAdded}`)
  console.log(`  Summary sheets      : ${stats.summarySheets}`)
  console.log(`  Errors              : ${stats.errors}`)
  console.log('='.repeat(65))
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
