import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get all subjects with topics
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, slug')
      .order('name')

    const results = {
      total: 0,
      success: 0,
      failed: 0,
      details: [] as any[]
    }

    for (const subject of subjects || []) {
      // Get all topics for this subject
      const { data: topics } = await supabase
        .from('topics')
        .select('id, name, slug, description')
        .eq('subject_id', subject.id)
        .order('order_index')

      for (const topic of topics || []) {
        // Check if mind map exists
        const { data: mindMaps } = await supabase
          .from('mind_maps')
          .select('id')
          .eq('topic_id', topic.id)

        // Check if summary sheet exists
        const { data: summarySheets } = await supabase
          .from('summary_sheets')
          .select('id')
          .eq('topic_id', topic.id)

        const needsMindMap = !mindMaps || mindMaps.length === 0
        const needsSummary = !summarySheets || summarySheets.length === 0

        if (needsMindMap || needsSummary) {
          results.total++

          try {
            // Call the generation endpoint
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/generate-missing-content`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                topicId: topic.id,
                subjectName: subject.name,
                topicName: topic.name,
                topicDescription: topic.description
              })
            })

            if (response.ok) {
              results.success++
              results.details.push({
                subject: subject.name,
                topic: topic.name,
                status: 'success'
              })
              console.log(`✅ ${results.success}/${results.total}: ${subject.name} > ${topic.name}`)
            } else {
              const error = await response.json()
              results.failed++
              results.details.push({
                subject: subject.name,
                topic: topic.name,
                status: 'failed',
                error: error.details || error.error
              })
              console.error(`❌ Failed: ${subject.name} > ${topic.name}`)
            }

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000))

          } catch (error) {
            results.failed++
            results.details.push({
              subject: subject.name,
              topic: topic.name,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            })
            console.error(`❌ Error: ${subject.name} > ${topic.name}`, error)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated content for ${results.success}/${results.total} topics`,
      results
    })

  } catch (error) {
    console.error('Batch generation error:', error)
    return NextResponse.json(
      {
        error: 'Batch generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
