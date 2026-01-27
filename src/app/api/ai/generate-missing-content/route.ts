import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { topicId, subjectName, topicName, topicDescription } = await request.json()

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log(`Generating content for ${subjectName} > ${topicName}`)

    // Generate Mind Map
    const mindMapPrompt = `You are an expert Cambridge IGCSE ${subjectName} educator. Create a comprehensive mind map for the topic "${topicName}".

Topic Description: ${topicDescription || 'IGCSE level content'}

Create a hierarchical mind map structure that:
- Has a clear central concept
- Branches into 4-6 main subtopics
- Each subtopic has 2-4 key points
- Uses clear, concise labels (2-4 words each)
- Covers all essential IGCSE content for this topic
- Is logically organized for revision

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "name": "${topicName} - Key Concepts",
  "root": {
    "id": "root",
    "label": "${topicName}",
    "children": [
      {
        "id": "branch1",
        "label": "Main Concept 1",
        "children": [
          { "id": "b1_1", "label": "Key Point 1" },
          { "id": "b1_2", "label": "Key Point 2" }
        ]
      }
    ]
  }
}`

    const mindMapMessage = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
      messages: [{ role: 'user', content: mindMapPrompt }]
    })

    const mindMapText = mindMapMessage.content[0].type === 'text' ? mindMapMessage.content[0].text : ''
    const mindMapMatch = mindMapText.match(/\{[\s\S]*\}/)
    if (!mindMapMatch) {
      throw new Error('Failed to extract mind map JSON')
    }
    const mindMapData = JSON.parse(mindMapMatch[0])

    // Generate Summary Sheet
    const summaryPrompt = `You are an expert Cambridge IGCSE ${subjectName} educator. Create a comprehensive summary sheet for the topic "${topicName}".

Topic Description: ${topicDescription || 'IGCSE level content'}

Create a summary sheet that includes:
- 5-8 key concepts (clear, concise statements)
- 6-10 important definitions with clear explanations
- Formulas (if applicable to this topic, otherwise use empty array)
- 5-7 exam tips specific to this topic

Make it:
- Clear and concise
- Perfect for last-minute revision
- Focused on what students need for exams
- Written at IGCSE level

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "title": "${topicName} - Summary Sheet",
  "key_concepts": [
    "Key concept 1",
    "Key concept 2"
  ],
  "definitions": [
    { "term": "Key Term", "definition": "Clear, concise definition of the term" },
    { "term": "Important Concept", "definition": "Detailed explanation of the concept" }
  ],
  "formulas": [
    { "name": "Formula Name", "formula": "x = y + z", "usage": "When to use this formula" }
  ],
  "exam_tips": [
    "Tip 1 for exam success",
    "Tip 2 for exam success"
  ]
}`

    const summaryMessage = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000,
      messages: [{ role: 'user', content: summaryPrompt }]
    })

    const summaryText = summaryMessage.content[0].type === 'text' ? summaryMessage.content[0].text : ''
    const summaryMatch = summaryText.match(/\{[\s\S]*\}/)
    if (!summaryMatch) {
      throw new Error('Failed to extract summary JSON')
    }
    const summaryData = JSON.parse(summaryMatch[0])

    // Insert mind map
    const { data: mindMap, error: mindMapError } = await supabase
      .from('mind_maps')
      .insert({
        topic_id: topicId,
        name: mindMapData.name,
        root_node: mindMapData.root
      })
      .select()
      .single()

    if (mindMapError) {
      console.error('Error inserting mind map:', mindMapError)
      throw mindMapError
    }

    // Insert summary sheet
    const { data: summarySheet, error: summaryError } = await supabase
      .from('summary_sheets')
      .insert({
        topic_id: topicId,
        title: summaryData.title,
        key_concepts: summaryData.key_concepts,
        definitions: summaryData.definitions,
        formulas: summaryData.formulas || [],
        exam_tips: summaryData.exam_tips
      })
      .select()
      .single()

    if (summaryError) {
      console.error('Error inserting summary sheet:', summaryError)
      throw summaryError
    }

    console.log(`✅ Generated content for ${topicName}`)

    return NextResponse.json({
      success: true,
      mindMap,
      summarySheet
    })

  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
