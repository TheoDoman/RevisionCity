import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get the specific topic
    const { data: topic } = await supabase
      .from('topics')
      .select('id, name, slug, subtopic_count')
      .eq('slug', 'characteristics-and-classification-of-living-organisms')
      .single()

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Get subtopics
    const { data: subtopics } = await supabase
      .from('subtopics')
      .select('*')
      .eq('topic_id', topic.id)
      .order('order_index')

    return NextResponse.json({
      topic,
      subtopicsInDB: subtopics?.length || 0,
      subtopics
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    )
  }
}
