import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get recently created mind maps (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    const { data: mindMaps } = await supabase
      .from('mind_maps')
      .select('id, name, created_at, topics(name, subjects(name))')
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false })

    const { data: summarySheets } = await supabase
      .from('summary_sheets')
      .select('id, title, created_at, topics(name, subjects(name))')
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      recentlyGenerated: {
        mindMaps: mindMaps?.map(m => ({
          name: m.name,
          subject: (m.topics as any)?.subjects?.name,
          topic: (m.topics as any)?.name,
          createdAt: m.created_at
        })) || [],
        summarySheets: summarySheets?.map(s => ({
          title: s.title,
          subject: (s.topics as any)?.subjects?.name,
          topic: (s.topics as any)?.name,
          createdAt: s.created_at
        })) || [],
        totalMindMaps: mindMaps?.length || 0,
        totalSummarySheets: summarySheets?.length || 0
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to check recent content' },
      { status: 500 }
    )
  }
}
