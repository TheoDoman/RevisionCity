import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = 'https://waqvyqpomedcejrkoikl.supabase.co'
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcXZ5cXBvbWVkY2VqcmtvaWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEzNjYxOCwiZXhwIjoyMDgzNzEyNjE4fQ.YcshqsIfUdvHVbNj0g2hADIi-QQW0C5kUQ5UnuQgiW8'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Utilities ──────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length === 0) return []

  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim())
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim()
    })
    rows.push(row)
  }

  return rows
}

function parseMultipleChoice(questionText: string, answerText: string) {
  // Detect " A) ... B) ... C) ... D) ..." pattern
  const mcIdx = questionText.search(/\s+A\)\s/)
  if (mcIdx === -1) {
    return {
      questionType: 'fill_blank' as const,
      question: questionText,
      options: null,
      correctAnswer: answerText,
    }
  }

  const baseQuestion = questionText.substring(0, mcIdx).trim()
  const optionsPart = questionText.substring(mcIdx)

  const optRegex = /[A-D]\)\s*(.*?)(?=\s+[A-D]\)|$)/g
  const matches = [...optionsPart.matchAll(optRegex)]
  const options = matches.map(m => m[1].trim())

  if (options.length < 2) {
    return {
      questionType: 'fill_blank' as const,
      question: questionText,
      options: null,
      correctAnswer: answerText,
    }
  }

  const letterMatch = answerText.match(/^([A-D])\)?/)
  const answerLetter = letterMatch?.[1]
  const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
  const idx = answerLetter !== undefined ? letterToIndex[answerLetter] ?? -1 : -1
  const correctAnswer =
    idx >= 0 && options[idx]
      ? options[idx]
      : answerText.replace(/^[A-D]\)\s*/, '').trim()

  return {
    questionType: 'multiple_choice' as const,
    question: baseQuestion,
    options,
    correctAnswer,
  }
}

const subjectMeta: Record<string, { icon: string; color: string; description: string }> = {
  mathematics: {
    icon: '📐',
    color: 'from-blue-500 to-indigo-600',
    description: 'Numbers, algebra, geometry, statistics and more.',
  },
  biology: {
    icon: '🧬',
    color: 'from-green-500 to-emerald-600',
    description: 'The study of living organisms and life processes.',
  },
  chemistry: {
    icon: '⚗️',
    color: 'from-purple-500 to-violet-600',
    description: 'Elements, compounds, reactions and matter.',
  },
  physics: {
    icon: '⚛️',
    color: 'from-cyan-500 to-blue-600',
    description: 'Forces, energy, waves, electricity and magnetism.',
  },
  'computer science': {
    icon: '💻',
    color: 'from-indigo-500 to-purple-600',
    description: 'Programming, algorithms, data structures and computer systems.',
  },
  'business studies': {
    icon: '💼',
    color: 'from-slate-500 to-gray-600',
    description: 'Business concepts, management, finance and enterprise.',
  },
  economics: {
    icon: '📈',
    color: 'from-teal-500 to-cyan-600',
    description: 'Micro and macroeconomics, markets and government policy.',
  },
  history: {
    icon: '🏛️',
    color: 'from-yellow-500 to-amber-600',
    description: '20th century world history and historical skills.',
  },
  geography: {
    icon: '🌍',
    color: 'from-lime-500 to-green-600',
    description: 'Physical and human geography, environmental management.',
  },
}

function getSubjectMeta(name: string) {
  const key = name.toLowerCase()
  return (
    subjectMeta[key] || {
      icon: '📚',
      color: 'from-gray-500 to-slate-600',
      description: `IGCSE ${name} revision materials.`,
    }
  )
}

// ── DB helpers with in-memory cache ───────────────────────────────────────

const subjectCache = new Map<string, string>() // slug → id
const topicCache = new Map<string, string>() // `${subjectId}:${slug}` → id
const subtopicCache = new Map<string, string>() // `${topicId}:${slug}` → id
const quizCache = new Map<string, string>() // subtopicId → quizId

async function getOrCreateSubject(
  name: string,
  examBoard: 'cambridge' | 'edexcel'
): Promise<string> {
  const slug = examBoard === 'edexcel' ? `${slugify(name)}-edexcel` : slugify(name)
  if (subjectCache.has(slug)) return subjectCache.get(slug)!

  const { data: existing } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', slug)
    .eq('exam_board', examBoard)
    .maybeSingle()

  if (existing) {
    subjectCache.set(slug, existing.id)
    return existing.id
  }

  const meta = getSubjectMeta(name)
  const displayName = examBoard === 'edexcel' ? `${name} (Edexcel)` : name

  const { data, error } = await supabase
    .from('subjects')
    .insert({
      name: displayName,
      slug,
      exam_board: examBoard,
      description: meta.description,
      icon: meta.icon,
      color: meta.color,
      topic_count: 0,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create subject "${name}": ${error.message}`)
  subjectCache.set(slug, data.id)
  return data.id
}

async function getOrCreateTopic(
  subjectId: string,
  topicName: string,
  orderIndex: number
): Promise<string> {
  const slug = slugify(topicName)
  const cacheKey = `${subjectId}:${slug}`
  if (topicCache.has(cacheKey)) return topicCache.get(cacheKey)!

  const { data: existing } = await supabase
    .from('topics')
    .select('id')
    .eq('subject_id', subjectId)
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    topicCache.set(cacheKey, existing.id)
    return existing.id
  }

  const { data, error } = await supabase
    .from('topics')
    .insert({
      subject_id: subjectId,
      name: topicName,
      slug,
      description: `${topicName} revision content`,
      order_index: orderIndex,
      subtopic_count: 0,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create topic "${topicName}": ${error.message}`)
  topicCache.set(cacheKey, data.id)
  return data.id
}

async function getOrCreateSubtopic(
  topicId: string,
  subtopicName: string,
  orderIndex: number
): Promise<string> {
  const slug = slugify(subtopicName)
  const cacheKey = `${topicId}:${slug}`
  if (subtopicCache.has(cacheKey)) return subtopicCache.get(cacheKey)!

  const { data: existing } = await supabase
    .from('subtopics')
    .select('id')
    .eq('topic_id', topicId)
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    subtopicCache.set(cacheKey, existing.id)
    return existing.id
  }

  const { data, error } = await supabase
    .from('subtopics')
    .insert({
      topic_id: topicId,
      name: subtopicName,
      slug,
      description: `${subtopicName} questions and content`,
      order_index: orderIndex,
      learning_objectives: [],
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create subtopic "${subtopicName}": ${error.message}`)
  subtopicCache.set(cacheKey, data.id)
  return data.id
}

async function getOrCreateQuiz(subtopicId: string, quizName: string): Promise<string> {
  if (quizCache.has(subtopicId)) return quizCache.get(subtopicId)!

  const { data: existing } = await supabase
    .from('quizzes')
    .select('id')
    .eq('subtopic_id', subtopicId)
    .maybeSingle()

  if (existing) {
    quizCache.set(subtopicId, existing.id)
    return existing.id
  }

  const { data, error } = await supabase
    .from('quizzes')
    .insert({ subtopic_id: subtopicId, name: quizName })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create quiz: ${error.message}`)
  quizCache.set(subtopicId, data.id)
  return data.id
}

// ── Cambridge loader ──────────────────────────────────────────────────────

async function loadCambridgeCSV(): Promise<number> {
  const csvPath = path.join(process.cwd(), 'content', 'cambridge-igcse-audit.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)

  console.log(`\nParsed ${rows.length} Cambridge rows`)

  // Group by Subject + Topic
  const groups = new Map<string, { rows: typeof rows; subject: string; topic: string }>()
  for (const row of rows) {
    if (!row.Subject || !row.Topic) continue
    const key = `${row.Subject}||${row.Topic}`
    if (!groups.has(key)) groups.set(key, { rows: [], subject: row.Subject, topic: row.Topic })
    groups.get(key)!.rows.push(row)
  }

  let count = 0
  const subjectTopicOrder = new Map<string, number>()
  const topicSubtopicOrder = new Map<string, number>()

  for (const [, group] of groups) {
    const { subject, topic } = group

    // Split "Number - Types of Numbers" → ["Number", "Types of Numbers"]
    let parentTopicName: string
    let subtopicName: string

    if (topic.includes(' - ')) {
      const dashIdx = topic.indexOf(' - ')
      parentTopicName = topic.substring(0, dashIdx).trim()
      subtopicName = topic.substring(dashIdx + 3).trim()
    } else {
      parentTopicName = topic
      subtopicName = 'Questions'
    }

    const subjectId = await getOrCreateSubject(subject, 'cambridge')

    const topicOrder = subjectTopicOrder.get(subjectId) ?? 0
    subjectTopicOrder.set(subjectId, topicOrder + 1)
    const topicId = await getOrCreateTopic(subjectId, parentTopicName, topicOrder)

    const subtopicOrder = topicSubtopicOrder.get(topicId) ?? 0
    topicSubtopicOrder.set(topicId, subtopicOrder + 1)
    const subtopicId = await getOrCreateSubtopic(topicId, subtopicName, subtopicOrder)

    const quizId = await getOrCreateQuiz(subtopicId, `${subtopicName} Quiz`)

    // Skip if questions already loaded
    const { count: existing } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId)

    if ((existing ?? 0) > 0) {
      console.log(`  ↩ Skip (exists): ${topic} (${group.rows.length} q)`)
      count += group.rows.length
      continue
    }

    const questions = group.rows.map(row => {
      const parsed = parseMultipleChoice(row.Question || '', row.Answer || '')
      const d = (row.Difficulty || '').toLowerCase()
      const difficulty = d === 'easy' ? 'easy' : d === 'medium' ? 'medium' : 'hard'

      return {
        quiz_id: quizId,
        question: parsed.question,
        question_type: parsed.questionType,
        options: parsed.options,
        correct_answer: parsed.correctAnswer,
        explanation: row.Explanation || '',
        difficulty,
      }
    })

    const { error } = await supabase.from('quiz_questions').insert(questions)
    if (error) {
      console.error(`  ✗ ${topic}: ${error.message}`)
    } else {
      count += questions.length
      console.log(`  ✓ ${topic}: ${questions.length} questions`)
    }
  }

  return count
}

// ── Edexcel loader ────────────────────────────────────────────────────────

async function loadEdexcelCSV(): Promise<number> {
  const csvPath = path.join(process.cwd(), 'content', 'edexcel-content-audit.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(content)

  console.log(`\nParsed ${rows.length} Edexcel rows`)

  // Group by Subject + Topic
  const groups = new Map<string, { rows: typeof rows; subject: string; topic: string }>()
  for (const row of rows) {
    if (!row.Subject || !row.Topic) continue
    const key = `${row.Subject}||${row.Topic}`
    if (!groups.has(key)) groups.set(key, { rows: [], subject: row.Subject, topic: row.Topic })
    groups.get(key)!.rows.push(row)
  }

  let count = 0
  const subjectTopicOrder = new Map<string, number>()
  const topicSubtopicOrder = new Map<string, number>()

  for (const [, group] of groups) {
    const { subject, topic } = group

    const subjectId = await getOrCreateSubject(subject, 'edexcel')

    const topicOrder = subjectTopicOrder.get(subjectId) ?? 0
    subjectTopicOrder.set(subjectId, topicOrder + 1)
    const topicId = await getOrCreateTopic(subjectId, topic, topicOrder)

    const subtopicOrder = topicSubtopicOrder.get(topicId) ?? 0
    topicSubtopicOrder.set(topicId, subtopicOrder + 1)
    const subtopicId = await getOrCreateSubtopic(topicId, 'Practice Questions', subtopicOrder)

    // Skip if already loaded
    const { count: existing } = await supabase
      .from('practice_questions')
      .select('*', { count: 'exact', head: true })
      .eq('subtopic_id', subtopicId)

    if ((existing ?? 0) > 0) {
      console.log(`  ↩ Skip (exists): ${topic} (${group.rows.length} q)`)
      count += group.rows.length
      continue
    }

    const questions = group.rows.map(row => {
      const d = (row.Difficulty || '').toLowerCase()
      const difficulty =
        d === 'foundation' ? 'foundation' : d === 'higher' ? 'higher' : 'extended'
      const marks = d === 'foundation' ? 2 : d === 'higher' ? 3 : 5

      return {
        subtopic_id: subtopicId,
        question: row.Question || '',
        marks,
        mark_scheme: [row.Answer || ''],
        example_answer: row.Answer || '',
        difficulty,
      }
    })

    const { error } = await supabase.from('practice_questions').insert(questions)
    if (error) {
      console.error(`  ✗ ${topic}: ${error.message}`)
    } else {
      count += questions.length
      console.log(`  ✓ ${topic}: ${questions.length} questions`)
    }
  }

  return count
}

// ── Update counts ─────────────────────────────────────────────────────────

async function updateCounts(): Promise<void> {
  console.log('\nUpdating subtopic/topic counts...')

  const { data: topics } = await supabase.from('topics').select('id')
  if (topics) {
    for (const t of topics) {
      const { count } = await supabase
        .from('subtopics')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', t.id)
      await supabase.from('topics').update({ subtopic_count: count ?? 0 }).eq('id', t.id)
    }
  }

  const { data: subjects } = await supabase.from('subjects').select('id')
  if (subjects) {
    for (const s of subjects) {
      const { count } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .eq('subject_id', s.id)
      await supabase.from('subjects').update({ topic_count: count ?? 0 }).eq('id', s.id)
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Loading CSV content into Supabase...')

  try {
    const cambridgeCount = await loadCambridgeCSV()
    const edexcelCount = await loadEdexcelCSV()
    await updateCounts()

    console.log('\n✅ Complete!')
    console.log(`  Cambridge quiz questions loaded : ${cambridgeCount}`)
    console.log(`  Edexcel practice questions loaded: ${edexcelCount}`)
  } catch (err) {
    console.error('\n❌ Fatal error:', err)
    process.exit(1)
  }
}

main()
