import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get Biology subject
    const { data: subject } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('slug', 'biology')
      .single()

    if (!subject) {
      return NextResponse.json({ error: 'Biology subject not found' }, { status: 404 })
    }

    // Get all biology topics
    const { data: topics } = await supabase
      .from('topics')
      .select('id, name, slug')
      .eq('subject_id', subject.id)
      .order('order_index')

    const contentReport = []

    for (const topic of topics || []) {
      // Check mind maps
      const { data: mindMaps } = await supabase
        .from('mind_maps')
        .select('id, name')
        .eq('topic_id', topic.id)

      // Check summary sheets
      const { data: summarySheets } = await supabase
        .from('summary_sheets')
        .select('id, title')
        .eq('topic_id', topic.id)

      contentReport.push({
        topic: topic.name,
        slug: topic.slug,
        mindMapCount: mindMaps?.length || 0,
        summarySheetCount: summarySheets?.length || 0,
        hasMindMap: (mindMaps?.length || 0) > 0,
        hasSummary: (summarySheets?.length || 0) > 0
      })
    }

    return NextResponse.json({
      subject: subject.name,
      totalTopics: topics?.length || 0,
      contentReport
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to check biology content' },
      { status: 500 }
    )
  }
}
