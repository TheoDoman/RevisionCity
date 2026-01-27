import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const topicId = '5e69f6aa-b013-4e52-85b1-d8b14ddd6897'

    // Check mind maps
    const { data: mindMaps, error: mmError } = await supabase
      .from('mind_maps')
      .select('id, name, topic_id, created_at')
      .eq('topic_id', topicId)

    // Check summary sheets
    const { data: summarySheets, error: ssError } = await supabase
      .from('summary_sheets')
      .select('id, title, topic_id, created_at')
      .eq('topic_id', topicId)

    // Also check if there are any mind maps with similar names
    const { data: allMindMaps } = await supabase
      .from('mind_maps')
      .select('id, name, topic_id, created_at')
      .ilike('name', '%Characteristics%')

    return NextResponse.json({
      topicId,
      mindMaps,
      mindMapsError: mmError,
      summarySheets,
      summaryError: ssError,
      allMatchingMindMaps: allMindMaps
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
