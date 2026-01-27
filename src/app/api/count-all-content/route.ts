import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Count all topics
    const { count: topicCount } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })

    // Count all mind maps
    const { count: mindMapCount } = await supabase
      .from('mind_maps')
      .select('*', { count: 'exact', head: true })

    // Count all summary sheets
    const { count: summaryCount } = await supabase
      .from('summary_sheets')
      .select('*', { count: 'exact', head: true })

    // Count all subtopics
    const { count: subtopicCount } = await supabase
      .from('subtopics')
      .select('*', { count: 'exact', head: true })

    const mindMapCoverage = topicCount ? (mindMapCount! / topicCount * 100).toFixed(1) : '0'
    const summaryCoverage = topicCount ? (summaryCount! / topicCount * 100).toFixed(1) : '0'

    return NextResponse.json({
      success: true,
      counts: {
        totalTopics: topicCount,
        totalSubtopics: subtopicCount,
        mindMaps: mindMapCount,
        summarySheets: summaryCount
      },
      coverage: {
        mindMaps: `${mindMapCoverage}%`,
        summarySheets: `${summaryCoverage}%`
      },
      status: mindMapCount === topicCount && summaryCount === topicCount
        ? '✅ COMPLETE'
        : `⏳ ${mindMapCount}/${topicCount} topics have content`
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to count content' },
      { status: 500 }
    )
  }
}
