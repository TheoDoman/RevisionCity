import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get all subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select('id, name, slug')
      .order('name')

    const fullReport = []
    let totalMissing = 0

    for (const subject of subjects || []) {
      // Get all topics for this subject
      const { data: topics } = await supabase
        .from('topics')
        .select('id, name, slug')
        .eq('subject_id', subject.id)
        .order('order_index')

      const missingContent = []

      for (const topic of topics || []) {
        // Check mind maps
        const { data: mindMaps } = await supabase
          .from('mind_maps')
          .select('id')
          .eq('topic_id', topic.id)

        // Check summary sheets
        const { data: summarySheets } = await supabase
          .from('summary_sheets')
          .select('id')
          .eq('topic_id', topic.id)

        const hasMindMap = (mindMaps?.length || 0) > 0
        const hasSummary = (summarySheets?.length || 0) > 0

        if (!hasMindMap || !hasSummary) {
          missingContent.push({
            topic: topic.name,
            slug: topic.slug,
            missingMindMap: !hasMindMap,
            missingSummary: !hasSummary
          })
          totalMissing++
        }
      }

      if (missingContent.length > 0) {
        fullReport.push({
          subject: subject.name,
          slug: subject.slug,
          totalTopics: topics?.length || 0,
          missingCount: missingContent.length,
          missingContent
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalSubjects: subjects?.length || 0,
      subjectsWithIssues: fullReport.length,
      totalMissingContent: totalMissing,
      report: fullReport
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to audit content' },
      { status: 500 }
    )
  }
}
