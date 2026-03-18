import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Get all subtopics with their parent info
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select(`id, name, slug, topics(id, name, subjects(id, name, exam_board))`)
    .order('id')

  if (!subtopics) { console.log('No subtopics'); return }

  // Get counts for each content type
  const [
    { data: notesData },
    { data: flashcardsData },
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

  for (const r of flashcardsData || []) {
    flashMap.set(r.subtopic_id, (flashMap.get(r.subtopic_id) || 0) + 1)
  }
  for (const r of quizData || []) {
    quizMap.set(r.subtopic_id, (quizMap.get(r.subtopic_id) || 0) + 1)
  }
  for (const r of practiceData || []) {
    practiceMap.set(r.subtopic_id, (practiceMap.get(r.subtopic_id) || 0) + 1)
  }
  for (const r of recallData || []) {
    recallMap.set(r.subtopic_id, (recallMap.get(r.subtopic_id) || 0) + 1)
  }

  let emptyCount = 0
  let missingNotes = 0
  let missingFlash = 0
  let missingQuiz = 0
  let missingPractice = 0
  let missingRecall = 0

  const gaps: any[] = []

  for (const s of subtopics) {
    const topic = s.topics as any
    const subject = topic?.subjects as any
    const hasNotes = notesSet.has(s.id)
    const flashCount = flashMap.get(s.id) || 0
    const quizCount = quizMap.get(s.id) || 0
    const practiceCount = practiceMap.get(s.id) || 0
    const recallCount = recallMap.get(s.id) || 0

    const missing = []
    if (!hasNotes) { missing.push('notes'); missingNotes++ }
    if (flashCount < 10) { missing.push(`flashcards(${flashCount})`); missingFlash++ }
    if (quizCount < 15) { missing.push(`quiz(${quizCount})`); missingQuiz++ }
    if (practiceCount < 10) { missing.push(`practice(${practiceCount})`); missingPractice++ }
    if (recallCount < 5) { missing.push(`recall(${recallCount})`); missingRecall++ }

    if (missing.length === 5) emptyCount++

    if (missing.length > 0) {
      gaps.push({
        id: s.id,
        name: s.name,
        subject: subject?.name,
        exam_board: subject?.exam_board,
        topic: topic?.name,
        missing
      })
    }
  }

  console.log(`\n📊 GAP ANALYSIS REPORT`)
  console.log('='.repeat(60))
  console.log(`Total subtopics: ${subtopics.length}`)
  console.log(`Completely empty (all 5 types missing): ${emptyCount}`)
  console.log(`\nMissing notes: ${missingNotes}`)
  console.log(`Missing flashcards (<10): ${missingFlash}`)
  console.log(`Missing quiz questions (<15): ${missingQuiz}`)
  console.log(`Missing practice questions (<10): ${missingPractice}`)
  console.log(`Missing recall prompts (<5): ${missingRecall}`)
  console.log('='.repeat(60))

  // Group by subject and exam board
  const bySubject = new Map<string, { board: string; total: number; missing: number }>()
  for (const g of gaps) {
    const key = `${g.subject} (${g.exam_board})`
    const cur = bySubject.get(key) || { board: g.exam_board, total: 0, missing: 0 }
    cur.missing++
    bySubject.set(key, cur)
  }
  
  // Count total per subject
  for (const s of subtopics) {
    const topic = s.topics as any
    const subject = topic?.subjects as any
    const key = `${subject?.name} (${subject?.exam_board})`
    const cur = bySubject.get(key) || { board: subject?.exam_board, total: 0, missing: 0 }
    cur.total++
    bySubject.set(key, cur)
  }

  console.log(`\n📚 BY SUBJECT:`)
  for (const [key, val] of Array.from(bySubject.entries()).sort()) {
    console.log(`  ${key}: ${val.missing} subtopics with gaps`)
  }
  
  console.log(`\n🔴 COMPLETELY EMPTY SUBTOPICS (no content at all):`)
  const empty = gaps.filter(g => g.missing.length === 5)
  for (const g of empty.slice(0, 20)) {
    console.log(`  - [${g.exam_board}] ${g.subject} > ${g.topic} > ${g.name}`)
  }
  if (empty.length > 20) console.log(`  ... and ${empty.length - 20} more`)
}

main().catch(console.error)
