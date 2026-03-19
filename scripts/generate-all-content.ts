/**
 * Comprehensive content generation script
 * Generates all missing content for IGCSE subtopics
 * Targets completely empty subtopics first, then fills gaps
 */
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface Gap {
  id: string
  name: string
  subject: string
  topic: string
  exam_board: string
  needsNotes: boolean
  needsFlashcards: boolean
  needsQuiz: boolean
  needsPractice: boolean
  needsRecall: boolean
}

interface GeneratedContent {
  notes?: string
  flashcards?: Array<{ front: string; back: string; difficulty: string }>
  quiz_questions?: Array<{
    question: string
    question_type: string
    options?: string[]
    correct_answer: string
    explanation: string
    difficulty: string
  }>
  practice_questions?: Array<{
    question: string
    marks: number
    mark_scheme: string[]
    example_answer: string
    difficulty: string
  }>
  recall_prompts?: Array<{
    prompt: string
    hints: string[]
    model_answer: string
    key_points_to_include: string[]
  }>
}

async function callAPI(prompt: string, retries = 3): Promise<GeneratedContent | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return null

      try {
        return JSON.parse(jsonMatch[0]) as GeneratedContent
      } catch {
        const cleaned = jsonMatch[0]
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
        return JSON.parse(cleaned) as GeneratedContent
      }
    } catch (err: any) {
      const isRetryable = err?.status === 529 || err?.error?.error?.type === 'overloaded_error' || err?.status === 429
      if (isRetryable && attempt < retries) {
        const wait = attempt * 15000  // 15s, 30s
        process.stdout.write(`    ⏳ Retry ${attempt}/${retries - 1} after ${wait / 1000}s...\n`)
        await new Promise(r => setTimeout(r, wait))
      } else {
        throw err
      }
    }
  }
  return null
}

async function generateAllContent(gap: Gap): Promise<GeneratedContent | null> {
  const specNote = gap.exam_board === 'edexcel' ? 'Edexcel IGCSE' : 'Cambridge IGCSE'
  const context = `subtopic "${gap.name}" in topic "${gap.topic}", subject "${gap.subject}" (${specNote})`
  const baseReq = `Return ONLY valid JSON. Be concise. No trailing commas. Specific to ${specNote} IGCSE level.`

  const result: GeneratedContent = {}

  // Call 1: notes + flashcards
  if (gap.needsNotes || gap.needsFlashcards) {
    const prompt = `You are an expert ${specNote} teacher. Generate revision content for ${context}.

${baseReq}

Return a JSON object with:
${gap.needsNotes ? `"notes": "Markdown notes with ## headings and bullet points covering key definitions, facts, examples, exam tips. Keep under 200 words."` : ''}
${gap.needsNotes && gap.needsFlashcards ? ',' : ''}
${gap.needsFlashcards ? `"flashcards": [exactly 10 objects: {front: "question", back: "concise answer", difficulty: "easy|medium|hard"}]` : ''}`

    try {
      const data = await callAPI(prompt)
      if (data?.notes) result.notes = data.notes
      if (data?.flashcards) result.flashcards = data.flashcards
    } catch (error) {
      console.error(`  ❌ Call 1 error for ${gap.name}:`, error)
    }
  }

  // Call 2: quiz questions only
  if (gap.needsQuiz) {
    const prompt = `You are an expert ${specNote} teacher. Generate revision content for ${context}.

${baseReq}

Return a JSON object with exactly this field:
"quiz_questions": [exactly 15 objects: {question: "...", question_type: "multiple_choice", options: ["A ...","B ...","C ...","D ..."], correct_answer: "A|B|C|D", explanation: "one sentence", difficulty: "easy|medium|hard"}]

Wrap in { }.`

    try {
      const data = await callAPI(prompt)
      if (data?.quiz_questions) result.quiz_questions = data.quiz_questions
    } catch (error) {
      console.error(`  ❌ Call 2 error for ${gap.name}:`, error)
    }
  }

  // Call 3: practice + recall
  if (gap.needsPractice || gap.needsRecall) {
    const parts: string[] = []
    if (gap.needsPractice) parts.push(`"practice_questions": [exactly 8 objects: {question: "exam-style [X marks]", marks: 2-6, mark_scheme: ["point 1","point 2"], example_answer: "brief model answer", difficulty: "easy|medium|hard"}]`)
    if (gap.needsRecall) parts.push(`"recall_prompts": [exactly 5 objects: {prompt: "Explain/Describe...", hints: ["h1","h2"], model_answer: "brief", key_points_to_include: ["p1","p2"]}]`)

    const prompt = `You are an expert ${specNote} teacher. Generate revision content for ${context}.

${baseReq}

Return a JSON object with:
${parts.join(',\n')}

Wrap in { }.`

    try {
      const data = await callAPI(prompt)
      if (data?.practice_questions) result.practice_questions = data.practice_questions
      if (data?.recall_prompts) result.recall_prompts = data.recall_prompts
    } catch (error) {
      console.error(`  ❌ Call 3 error for ${gap.name}:`, error)
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

async function insertContent(gap: Gap, content: GeneratedContent) {
  const results = { notes: false, flashcards: false, quiz: false, practice: false, recall: false }

  // Insert notes
  if (content.notes && gap.needsNotes) {
    const { error } = await supabase.from('notes').insert({
      subtopic_id: gap.id,
      title: `${gap.name} - Revision Notes`,
      content: content.notes,
      key_points: []
    })
    if (!error) { results.notes = true; console.log('    ✅ Notes') }
    else console.error('    ❌ Notes insert error:', error.message)
  }

  // Insert flashcards
  if (content.flashcards && gap.needsFlashcards && content.flashcards.length > 0) {
    // Get or create flashcard set
    let setId: string | null = null
    const { data: existing } = await supabase
      .from('flashcard_sets')
      .select('id')
      .eq('subtopic_id', gap.id)
      .maybeSingle()
    if (existing) {
      setId = existing.id
    } else {
      const { data: setData } = await supabase
        .from('flashcard_sets')
        .insert({ subtopic_id: gap.id, name: `${gap.name} - Flashcards` })
        .select('id')
        .single()
      setId = setData?.id || null
    }

    if (setId) {
      const flashcardRows = content.flashcards.map(fc => ({
        flashcard_set_id: setId,
        subtopic_id: gap.id,
        front: fc.front,
        back: fc.back,
        difficulty: fc.difficulty || 'medium'
      }))
      const { error } = await supabase.from('flashcards').insert(flashcardRows)
      if (!error) { results.flashcards = true; console.log(`    ✅ ${content.flashcards.length} Flashcards`) }
      else console.error('    ❌ Flashcards insert error:', error.message)
    }
  }

  // Insert quiz questions
  if (content.quiz_questions && gap.needsQuiz && content.quiz_questions.length > 0) {
    // Get or create quiz
    let quizId: string | null = null
    const { data: existingQuiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('subtopic_id', gap.id)
      .maybeSingle()
    if (existingQuiz) {
      quizId = existingQuiz.id
    } else {
      const { data: quizData } = await supabase
        .from('quizzes')
        .insert({ subtopic_id: gap.id, name: `${gap.name} - Quiz` })
        .select('id')
        .single()
      quizId = quizData?.id || null
    }
    const quizData = quizId ? { id: quizId } : null
    if (quizData) {
      const quizRows = content.quiz_questions.map(q => ({
        quiz_id: quizData.id,
        subtopic_id: gap.id,
        question: q.question,
        question_type: q.question_type || 'multiple_choice',
        options: q.options || [],
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium'
      }))
      const { error } = await supabase.from('quiz_questions').insert(quizRows)
      if (!error) { results.quiz = true; console.log(`    ✅ ${content.quiz_questions.length} Quiz questions`) }
      else console.error('    ❌ Quiz questions insert error:', error.message)
    }
  }

  // Insert practice questions
  if (content.practice_questions && gap.needsPractice && content.practice_questions.length > 0) {
    const rows = content.practice_questions.map(q => ({
      subtopic_id: gap.id,
      question: q.question,
      marks: q.marks || 3,
      mark_scheme: q.mark_scheme || [],
      example_answer: q.example_answer || '',
      difficulty: q.difficulty || 'medium'
    }))
    const { error } = await supabase.from('practice_questions').insert(rows)
    if (!error) { results.practice = true; console.log(`    ✅ ${content.practice_questions.length} Practice questions`) }
    else console.error('    ❌ Practice insert error:', error.message)
  }

  // Insert recall prompts
  if (content.recall_prompts && gap.needsRecall && content.recall_prompts.length > 0) {
    const rows = content.recall_prompts.map(r => ({
      subtopic_id: gap.id,
      prompt: r.prompt,
      hints: r.hints || [],
      model_answer: r.model_answer || '',
      key_points_to_include: r.key_points_to_include || []
    }))
    const { error } = await supabase.from('recall_prompts').insert(rows)
    if (!error) { results.recall = true; console.log(`    ✅ ${content.recall_prompts.length} Recall prompts`) }
    else console.error('    ❌ Recall insert error:', error.message)
  }

  return results
}

async function main() {
  const startTime = Date.now()
  const batchSize = parseInt(process.env.BATCH_SIZE || '5')
  const maxSubtopics = parseInt(process.env.MAX_SUBTOPICS || '999999')

  console.log('🚀 COMPREHENSIVE CONTENT GENERATION')
  console.log('='.repeat(60))
  console.log(`Batch size: ${batchSize}, Max subtopics: ${maxSubtopics}\n`)

  // Get all subtopics with parent info
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select(`id, name, topics(name, subjects(name, exam_board))`)
    .order('id')

  if (!subtopics) { console.log('No subtopics found'); return }

  // Get all existing content counts per subtopic
  const [
    { data: notesData },
    { data: flashData },
    { data: quizData },
    { data: practiceData },
    { data: recallData }
  ] = await Promise.all([
    supabase.from('notes').select('subtopic_id'),
    supabase.from('flashcards').select('subtopic_id'),
    supabase.from('quiz_questions').select('subtopic_id'),
    supabase.from('practice_questions').select('subtopic_id'),
    supabase.from('recall_prompts').select('subtopic_id')
  ])

  const notesSet = new Set(notesData?.map(r => r.subtopic_id) || [])
  const flashMap = new Map<string, number>()
  const quizMap = new Map<string, number>()
  const practiceMap = new Map<string, number>()
  const recallMap = new Map<string, number>()

  for (const r of flashData || []) flashMap.set(r.subtopic_id, (flashMap.get(r.subtopic_id) || 0) + 1)
  for (const r of quizData || []) quizMap.set(r.subtopic_id, (quizMap.get(r.subtopic_id) || 0) + 1)
  for (const r of practiceData || []) practiceMap.set(r.subtopic_id, (practiceMap.get(r.subtopic_id) || 0) + 1)
  for (const r of recallData || []) recallMap.set(r.subtopic_id, (recallMap.get(r.subtopic_id) || 0) + 1)

  // Build gap list - prioritize completely empty subtopics
  const gaps: Gap[] = []

  for (const s of subtopics) {
    const topic = s.topics as any
    const subject = topic?.subjects as any
    if (!subject || !topic) continue

    const needsNotes = !notesSet.has(s.id)
    const needsFlashcards = (flashMap.get(s.id) || 0) < 10
    const needsQuiz = (quizMap.get(s.id) || 0) < 15
    const needsPractice = (practiceMap.get(s.id) || 0) < 8   // script generates 8
    const needsRecall = (recallMap.get(s.id) || 0) < 5

    if (needsNotes || needsFlashcards || needsQuiz || needsPractice || needsRecall) {
      gaps.push({
        id: s.id,
        name: s.name,
        subject: subject.name,
        topic: topic.name,
        exam_board: subject.exam_board || 'cambridge',
        needsNotes,
        needsFlashcards,
        needsQuiz,
        needsPractice,
        needsRecall
      })
    }
  }

  // Sort: completely empty first
  gaps.sort((a, b) => {
    const aEmpty = [a.needsNotes, a.needsFlashcards, a.needsQuiz, a.needsPractice, a.needsRecall].filter(Boolean).length
    const bEmpty = [b.needsNotes, b.needsFlashcards, b.needsQuiz, b.needsPractice, b.needsRecall].filter(Boolean).length
    return bEmpty - aEmpty
  })

  const toProcess = gaps.slice(0, maxSubtopics)
  console.log(`Found ${gaps.length} subtopics with gaps. Processing ${toProcess.length} with concurrency ${batchSize}.\n`)

  let stats = { processed: 0, notesAdded: 0, flashcardsAdded: 0, quizAdded: 0, practiceAdded: 0, recallAdded: 0, errors: 0 }
  let completed = 0

  // Process in parallel batches
  for (let i = 0; i < toProcess.length; i += batchSize) {
    const batch = toProcess.slice(i, i + batchSize)
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    const eta = completed > 0 ? Math.round((elapsed / completed) * (toProcess.length - completed)) : '?'
    console.log(`\n🔄 Batch ${Math.floor(i / batchSize) + 1} | Progress: ${completed}/${toProcess.length} (${Math.round(completed / toProcess.length * 100)}%) | ETA: ${eta}s`)

    await Promise.all(batch.map(async (gap) => {
      const label = `${gap.subject} > ${gap.topic} > ${gap.name}`
      process.stdout.write(`  ⏳ ${label}\n`)

      const content = await generateAllContent(gap)
      if (!content) {
        stats.errors++
        return
      }

      const results = await insertContent(gap, content)
      if (results.notes) stats.notesAdded++
      if (results.flashcards) stats.flashcardsAdded++
      if (results.quiz) stats.quizAdded++
      if (results.practice) stats.practiceAdded++
      if (results.recall) stats.recallAdded++
      stats.processed++
      completed++
      process.stdout.write(`  ✅ ${label}\n`)
    }))
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000)
  console.log('\n\n' + '='.repeat(60))
  console.log('✨ CONTENT GENERATION COMPLETE!')
  console.log('='.repeat(60))
  console.log(`⏱️  Total time: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`)
  console.log(`📊 Processed: ${stats.processed}/${toProcess.length}`)
  console.log(`📝 Notes added: ${stats.notesAdded}`)
  console.log(`🃏 Flashcard sets added: ${stats.flashcardsAdded}`)
  console.log(`❓ Quiz sets added: ${stats.quizAdded}`)
  console.log(`📋 Practice sets added: ${stats.practiceAdded}`)
  console.log(`🧠 Recall sets added: ${stats.recallAdded}`)
  console.log(`❌ Errors: ${stats.errors}`)
  console.log('='.repeat(60))
}

main().catch(console.error)
