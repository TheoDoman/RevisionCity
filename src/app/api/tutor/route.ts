import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ── In-memory rate limiter: 5 req/min per IP ─────────────────────────────
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const windowMs = 60_000
  const limit = 5

  const prev = (rateLimitMap.get(ip) ?? []).filter(t => now - t < windowMs)
  if (prev.length >= limit) {
    const oldest = prev[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    return { allowed: false, retryAfter }
  }
  prev.push(now)
  rateLimitMap.set(ip, prev)
  return { allowed: true, retryAfter: 0 }
}

// ── Socratic system prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert IGCSE/A-Level tutor who teaches through the Socratic method. Your role is to guide students to discover answers themselves through questioning, never to give direct answers immediately.

CORE RULES:
1. NEVER state the answer directly in your first response. Always ask a guiding question first.
2. Break complex topics into smaller, manageable sub-questions.
3. Build on what the student already knows — ask what they think first.
4. Use analogies and real-world examples to help students connect concepts.
5. Praise correct reasoning (not just correct answers) to build confidence.

STUCK DETECTION:
- Track the conversation. If a student has given 3+ incorrect or incomplete attempts on the same question, THEN you may provide a more structured hint (but still not the full answer).
- After 5+ failed attempts on the same point, provide a direct explanation with key steps highlighted.

EXAM CONTEXT:
- All students are preparing for Cambridge IGCSE or Edexcel IGCSE exams.
- Reference specification points when helpful (e.g. "This appears on the 0580 specification under section 2.3").
- Use mark-scheme language: "State", "Describe", "Explain", "Calculate", "Evaluate".
- Remind students how many marks a type of question is typically worth.

FLASHCARD SUGGESTION:
After each explanation exchange (once the student has understood a concept), append a flashcard suggestion in EXACTLY this format on its own line at the end of your message:
[FLASHCARD: {front} | {back}]
Example: [FLASHCARD: What is the role of mitochondria? | To produce ATP through aerobic respiration — the 'powerhouse' of the cell]

Only include ONE flashcard per response, and only when a clear concept has been fully understood. Do NOT include it if the explanation is still ongoing.

TONE: Encouraging, patient, conversational. You are a friendly tutor, not a textbook. Use plain language.

Example interaction:
Student: "What is photosynthesis?"
You: "Great question! Let's figure it out together. The word 'photosynthesis' has two parts — 'photo' and 'synthesis'. What do you think each part might mean?"`

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const { allowed, retryAfter } = checkRateLimit(ip)
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded', retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    )
  }

  let body: {
    question: string
    subject: string
    topic: string
    difficulty?: string
    examBoard?: string
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>
  }

  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { question, subject, topic, difficulty, examBoard, messages = [] } = body

  if (!question?.trim() || !subject || !topic) {
    return new Response(
      JSON.stringify({ error: 'question, subject, and topic are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (question.length > 500) {
    return new Response(
      JSON.stringify({ error: 'Question exceeds 500 character limit' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI tutor unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const anthropic = new Anthropic({ apiKey })

  // Build context-aware system prompt
  const boardLabel = examBoard === 'edexcel' ? 'Edexcel' : 'Cambridge'
  const contextualSystem = `${SYSTEM_PROMPT}

CURRENT SESSION CONTEXT:
- Subject: ${subject} (${boardLabel} IGCSE)
- Topic: ${topic}
- Difficulty level: ${difficulty ?? 'intermediate'}

Focus all your questions and explanations on this specific topic and exam board.`

  // Build conversation history — keep last 10 turns to limit tokens
  const recentMessages = messages.slice(-10)
  const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...recentMessages,
    { role: 'user', content: question },
  ]

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-3-haiku-20240307',
      max_tokens: 800,
      system: contextualSystem,
      messages: anthropicMessages,
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[AI Tutor] Error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to get tutor response. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
