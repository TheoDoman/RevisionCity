import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Common placeholder patterns to detect
const PLACEHOLDER_PATTERNS = [
  /placeholder/i,
  /lorem ipsum/i,
  /TODO/i,
  /TBD/i,
  /coming soon/i,
  /under construction/i,
  /\[insert.*here\]/i,
  /\[to be added\]/i,
  /sample content/i,
  /test content/i,
  /dummy data/i,
  /example text/i,
  /filler text/i,
  /xxx/i,
  /yyy/i,
  /zzz/i,
]

function containsPlaceholder(text: string): boolean {
  if (!text) return false
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))
}

function extractPlaceholderContext(text: string, maxLength = 100): string {
  if (!text) return ''

  for (const pattern of PLACEHOLDER_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const index = match.index || 0
      const start = Math.max(0, index - 30)
      const end = Math.min(text.length, index + maxLength)
      return '...' + text.substring(start, end) + '...'
    }
  }

  return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '')
}

export async function GET() {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: 0,
        issuesByType: {
          notes: 0,
          flashcards: 0,
          quizzes: 0,
          practice: 0,
          recall: 0,
          mindMaps: 0,
          summaries: 0
        }
      },
      issues: [] as any[]
    }

    // Check Notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, subtopic_id, content, title')

    if (!notesError && notes) {
      for (const note of notes) {
        if (containsPlaceholder(note.content) || containsPlaceholder(note.title)) {
          report.summary.issuesByType.notes++
          report.summary.totalIssues++
          report.issues.push({
            type: 'notes',
            id: note.id,
            subtopic_id: note.subtopic_id,
            field: containsPlaceholder(note.title) ? 'title' : 'content',
            context: extractPlaceholderContext(containsPlaceholder(note.title) ? note.title : note.content)
          })
        }
      }
    }

    // Check Flashcards
    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('id, subtopic_id, front, back')

    if (!flashcardsError && flashcards) {
      for (const card of flashcards) {
        if (containsPlaceholder(card.front) || containsPlaceholder(card.back)) {
          report.summary.issuesByType.flashcards++
          report.summary.totalIssues++
          report.issues.push({
            type: 'flashcards',
            id: card.id,
            subtopic_id: card.subtopic_id,
            field: containsPlaceholder(card.front) ? 'front' : 'back',
            context: extractPlaceholderContext(containsPlaceholder(card.front) ? card.front : card.back)
          })
        }
      }
    }

    // Check Quiz Questions
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quiz_questions')
      .select('id, subtopic_id, question, answer, explanation')

    if (!quizzesError && quizzes) {
      for (const quiz of quizzes) {
        const fields = ['question', 'answer', 'explanation']
        for (const field of fields) {
          if (containsPlaceholder(quiz[field as keyof typeof quiz] as string)) {
            report.summary.issuesByType.quizzes++
            report.summary.totalIssues++
            report.issues.push({
              type: 'quiz_questions',
              id: quiz.id,
              subtopic_id: quiz.subtopic_id,
              field: field,
              context: extractPlaceholderContext(quiz[field as keyof typeof quiz] as string)
            })
            break
          }
        }
      }
    }

    // Check Practice Questions
    const { data: practice, error: practiceError } = await supabase
      .from('practice_questions')
      .select('id, subtopic_id, question, answer, mark_scheme')

    if (!practiceError && practice) {
      for (const pq of practice) {
        const fields = ['question', 'answer', 'mark_scheme']
        for (const field of fields) {
          if (containsPlaceholder(pq[field as keyof typeof pq] as string)) {
            report.summary.issuesByType.practice++
            report.summary.totalIssues++
            report.issues.push({
              type: 'practice_questions',
              id: pq.id,
              subtopic_id: pq.subtopic_id,
              field: field,
              context: extractPlaceholderContext(pq[field as keyof typeof pq] as string)
            })
            break
          }
        }
      }
    }

    // Check Active Recall
    const { data: recall, error: recallError } = await supabase
      .from('recall_prompts')
      .select('id, subtopic_id, prompt, answer')

    if (!recallError && recall) {
      for (const rp of recall) {
        if (containsPlaceholder(rp.prompt) || containsPlaceholder(rp.answer)) {
          report.summary.issuesByType.recall++
          report.summary.totalIssues++
          report.issues.push({
            type: 'recall_prompts',
            id: rp.id,
            subtopic_id: rp.subtopic_id,
            field: containsPlaceholder(rp.prompt) ? 'prompt' : 'answer',
            context: extractPlaceholderContext(containsPlaceholder(rp.prompt) ? rp.prompt : rp.answer)
          })
        }
      }
    }

    // Check Mind Maps
    const { data: mindMaps, error: mindMapsError } = await supabase
      .from('mind_maps')
      .select('id, topic_id, name, root_node')

    if (!mindMapsError && mindMaps) {
      for (const mm of mindMaps) {
        // Check name
        if (containsPlaceholder(mm.name)) {
          report.summary.issuesByType.mindMaps++
          report.summary.totalIssues++
          report.issues.push({
            type: 'mind_maps',
            id: mm.id,
            topic_id: mm.topic_id,
            field: 'name',
            context: extractPlaceholderContext(mm.name)
          })
        }

        // Check root_node content (it's JSON)
        if (mm.root_node) {
          const rootNodeStr = typeof mm.root_node === 'string'
            ? mm.root_node
            : JSON.stringify(mm.root_node)

          if (containsPlaceholder(rootNodeStr)) {
            report.summary.issuesByType.mindMaps++
            report.summary.totalIssues++
            report.issues.push({
              type: 'mind_maps',
              id: mm.id,
              topic_id: mm.topic_id,
              field: 'root_node',
              context: extractPlaceholderContext(rootNodeStr, 200)
            })
          }
        }
      }
    }

    // Check Summary Sheets
    const { data: summaries, error: summariesError } = await supabase
      .from('summary_sheets')
      .select('id, topic_id, title, key_concepts, definitions, formulas, exam_tips')

    if (!summariesError && summaries) {
      for (const ss of summaries) {
        const fields = ['title', 'key_concepts', 'definitions', 'formulas', 'exam_tips']
        for (const field of fields) {
          const value = ss[field as keyof typeof ss]
          let textToCheck = ''

          if (typeof value === 'string') {
            textToCheck = value
          } else if (Array.isArray(value)) {
            textToCheck = JSON.stringify(value)
          } else if (value && typeof value === 'object') {
            textToCheck = JSON.stringify(value)
          }

          if (textToCheck && containsPlaceholder(textToCheck)) {
            report.summary.issuesByType.summaries++
            report.summary.totalIssues++
            report.issues.push({
              type: 'summary_sheets',
              id: ss.id,
              topic_id: ss.topic_id,
              field: field,
              context: extractPlaceholderContext(textToCheck, 200)
            })
            break
          }
        }
      }
    }

    // Add metadata about what was checked
    const metadata = {
      notesChecked: notes?.length || 0,
      flashcardsChecked: flashcards?.length || 0,
      quizzesChecked: quizzes?.length || 0,
      practiceChecked: practice?.length || 0,
      recallChecked: recall?.length || 0,
      mindMapsChecked: mindMaps?.length || 0,
      summariesChecked: summaries?.length || 0
    }

    return NextResponse.json({
      ...report,
      metadata,
      status: report.summary.totalIssues === 0 ? 'CLEAN' : 'ISSUES_FOUND'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Placeholder detection error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to detect placeholders' },
      { status: 500 }
    )
  }
}
