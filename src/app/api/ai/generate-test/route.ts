import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { getAnthropicApiKey } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    const { subjectId, topicId, difficulty, questionCount } = await request.json()

    // Get API key from config (handles env vars + fallback)
    const apiKey = getAnthropicApiKey()

    // Initialize clients
    const anthropic = new Anthropic({ apiKey })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get subject and topic names
    const { data: subject } = await supabase
      .from('subjects')
      .select('name, slug')
      .eq('id', subjectId)
      .single()

    const { data: topic } = await supabase
      .from('topics')
      .select('name, description')
      .eq('id', topicId)
      .single()

    if (!subject || !topic) {
      return NextResponse.json({ error: 'Subject or topic not found' }, { status: 404 })
    }

    // Check if user has premium or free tier usage
    // TODO: Implement usage tracking for free tier (3 tests/month)

    // Generate test using Claude
    const difficultyDescription = difficulty <= 3 ? 'Foundation/Easy' :
                                  difficulty <= 7 ? 'Intermediate' :
                                  'Higher/Challenging'

    const prompt = `You are an expert Cambridge IGCSE ${subject.name} examiner. Generate a practice test with exactly ${questionCount} questions on the topic "${topic.name}".

Topic Description: ${topic.description || 'IGCSE level content'}

Requirements:
- Difficulty Level: ${difficultyDescription} (${difficulty}/10)
- ${questionCount} questions total
- Mix of question types: multiple choice, short answer, and longer response questions
- Include mark allocations for each question
- Make questions unique and exam-style
- Cover different aspects of the topic
- Questions should test understanding, not just memorization
- IMPORTANT: Include the correct answer for each question
- IMPORTANT: Include a brief explanation for each answer

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Question text here",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "answer": "A. Option 1",
      "explanation": "Brief explanation of why this is correct",
      "marks": 1,
      "difficulty": ${difficulty}
    },
    {
      "id": 2,
      "type": "short_answer",
      "question": "Question text here",
      "answer": "Expected answer or key points",
      "explanation": "What a good answer should include",
      "marks": 3,
      "difficulty": ${difficulty}
    }
  ],
  "metadata": {
    "subject": "${subject.name}",
    "topic": "${topic.name}",
    "totalMarks": 0,
    "difficulty": ${difficulty},
    "questionCount": ${questionCount}
  }
}`

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response - try multiple approaches
    let testData
    try {
      // First try: direct JSON parse
      testData = JSON.parse(responseText)
    } catch {
      // Second try: extract JSON block
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('AI Response:', responseText)
        throw new Error('Failed to extract JSON from AI response')
      }

      // Use jsonrepair for robust parsing
      const { jsonrepair } = await import('jsonrepair')
      const sanitizedJson = jsonMatch[0].replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      testData = JSON.parse(jsonrepair(sanitizedJson))
    }

    // Calculate total marks
    const totalMarks = testData.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0)
    testData.metadata.totalMarks = totalMarks

    // TODO: Save test to database for tracking
    // TODO: Increment user's usage count

    return NextResponse.json({
      success: true,
      test: testData
    })

  } catch (error) {
    console.error('Error generating test:', error)

    // Check if it's an Anthropic API error
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Failed to generate test',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check that ANTHROPIC_API_KEY is set in environment variables'
      },
      { status: 500 }
    )
  }
}
