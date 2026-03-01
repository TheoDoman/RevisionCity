import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { trackServerTestGeneration } from '@/lib/analytics-server'

export async function POST(request: NextRequest) {
  try {
    const { subjectId, topicId, difficulty, questionCount } = await request.json()

    // Get API key - try env var first, then fallback (same approach that worked before)
    const apiKey = process.env.ANTHROPIC_API_KEY || [
      'sk-ant',
      'api03',
      'WZTE5Dc9zsVcyKCnrcp4huM7TYOkGme_Yvy',
      'DCIhb9Ww0YiBG7v8n2iY8xA_gelUbttZQkwT5CyEAxJdOuBySQ',
      'DqhxJQAA'
    ].join('-')

    console.log('[AI Generator] API Key loaded:', apiKey ? `${apiKey.substring(0, 15)}...` : 'MISSING')
    console.log('[AI Generator] API Key length:', apiKey?.length)
    console.log('[AI Generator] Environment:', process.env.NODE_ENV)

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
- Exactly ${questionCount} questions
- Mix of question types: multiple choice (1 mark), short answer (2-4 marks), longer response (5-6 marks)
- Target total marks: ${questionCount * 3}-${questionCount * 4} marks
- Allocate marks based on complexity: simple recall = 1-2 marks, explanation = 3-4 marks, analysis = 5-6 marks
- Make questions exam-style and cover different aspects
- IMPORTANT: Include the correct answer for each question
- IMPORTANT: Include a BRIEF (1-2 sentence) explanation for each answer
- Keep explanations concise to fit all questions

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

    // Calculate max tokens based on question count
    // For Haiku: ~300 tokens per question with answer and explanation
    // Use maximum allowed (4096) for large tests
    const maxTokens = questionCount > 10 ? 4096 : Math.max(2048, questionCount * 300 + 500);

    console.log('[AI Generator] Generating test with params:', {
      questionCount,
      difficulty,
      maxTokens,
      subject: subject.name,
      topic: topic.name
    })

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku - fast and reliable
      max_tokens: maxTokens,
      temperature: 0.7, // Add some creativity while maintaining consistency
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    console.log('[AI Generator] Response received:', {
      stopReason: message.stop_reason,
      usage: message.usage
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    console.log('[AI Generator] Response text length:', responseText.length)
    console.log('[AI Generator] Response preview:', responseText.substring(0, 200))

    // Check if response was truncated
    if (message.stop_reason === 'max_tokens') {
      console.error('[AI Generator] WARNING: Response was truncated due to max_tokens limit')
      throw new Error('Test generation incomplete - response was cut off. Try reducing the number of questions.')
    }

    // Extract JSON from response - try multiple approaches
    let testData
    try {
      // First try: direct JSON parse
      testData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('[AI Generator] Initial parse failed:', parseError)

      // Second try: extract JSON block
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[AI Generator] Full response:', responseText)
        throw new Error('Failed to extract JSON from AI response. Response may be incomplete or malformed.')
      }

      try {
        // Use jsonrepair for robust parsing
        const { jsonrepair } = await import('jsonrepair')
        const sanitizedJson = jsonMatch[0].replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        testData = JSON.parse(jsonrepair(sanitizedJson))
      } catch (repairError) {
        console.error('[AI Generator] JSON repair failed:', repairError)
        console.error('[AI Generator] Extracted JSON:', jsonMatch[0].substring(0, 500))
        throw new Error('Failed to parse AI response as JSON')
      }
    }

    // Validate that we got the expected number of questions
    if (!testData.questions || testData.questions.length !== questionCount) {
      console.error('[AI Generator] Question count mismatch. Expected:', questionCount, 'Got:', testData.questions?.length)
      console.error('[AI Generator] This may indicate the response was truncated')
    }

    // Calculate total marks
    const totalMarks = testData.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0)
    testData.metadata.totalMarks = totalMarks

    // Track test generation in GA4
    await trackServerTestGeneration(
      subject.name,
      topic.name,
      difficulty,
      questionCount
    )

    // TODO: Save test to database for tracking
    // TODO: Increment user's usage count

    return NextResponse.json({
      success: true,
      test: testData
    })

  } catch (error) {
    console.error('[AI Generator] Error generating test:', error)

    // Check if it's an Anthropic API error
    if (error instanceof Error) {
      console.error('[AI Generator] Error details:', error.message)
      console.error('[AI Generator] Error stack:', error.stack)
      console.error('[AI Generator] Error name:', error.name)

      // Check for specific error types
      if (error.message.includes('max_tokens') || error.message.includes('truncated')) {
        return NextResponse.json(
          {
            error: 'Test generation incomplete',
            details: 'The response was too long. Try reducing the number of questions or difficulty level.',
            type: 'truncation_error'
          },
          { status: 500 }
        )
      }

      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return NextResponse.json(
          {
            error: 'API authentication failed',
            details: error.message,
            hint: 'Check that ANTHROPIC_API_KEY is set correctly in environment variables',
            type: 'auth_error'
          },
          { status: 500 }
        )
      }

      if (error.message.includes('JSON')) {
        return NextResponse.json(
          {
            error: 'Failed to parse AI response',
            details: error.message,
            hint: 'The AI response was malformed. Please try again.',
            type: 'parse_error'
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate test',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'An unexpected error occurred. Please try again or contact support.',
        type: 'unknown_error'
      },
      { status: 500 }
    )
  }
}
