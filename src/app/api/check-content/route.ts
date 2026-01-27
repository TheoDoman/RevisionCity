import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get all topics with their subjects
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('id, name, slug, subjects(name)')

    if (topicsError) throw topicsError

    const issues = []

    // Check mind maps for each topic
    for (const topic of topics || []) {
      const { data: mindMaps, error: mindMapError } = await supabase
        .from('mind_maps')
        .select('id, name, root_node')
        .eq('topic_id', topic.id)

      if (mindMapError) {
        console.error(`Error fetching mind maps for topic ${topic.name}:`, mindMapError)
        continue
      }

      const subject = (topic.subjects as any)?.name || 'Unknown'
      const fullPath = `${subject} > ${topic.name}`

      if (!mindMaps || mindMaps.length === 0) {
        issues.push({
          id: topic.id,
          path: fullPath,
          issue: 'No mind map found',
          field: 'mind_maps',
          type: 'missing'
        })
      } else {
        // Check if mind maps have placeholder content
        mindMaps.forEach((mindMap: any) => {
          if (!mindMap.root_node ||
              JSON.stringify(mindMap.root_node).toLowerCase().includes('placeholder') ||
              JSON.stringify(mindMap.root_node).includes('TODO') ||
              JSON.stringify(mindMap.root_node).toLowerCase().includes('coming soon')) {
            issues.push({
              id: mindMap.id,
              path: `${fullPath} (Mind Map: ${mindMap.name})`,
              issue: 'Placeholder mind map content',
              field: 'mind_maps',
              type: 'placeholder'
            })
          }
        })
      }

      // Check summary sheets for each topic
      const { data: summarySheets, error: summaryError } = await supabase
        .from('summary_sheets')
        .select('id, title, key_concepts, definitions')
        .eq('topic_id', topic.id)

      if (summaryError) {
        console.error(`Error fetching summary sheets for topic ${topic.name}:`, summaryError)
        continue
      }

      if (!summarySheets || summarySheets.length === 0) {
        issues.push({
          id: topic.id,
          path: fullPath,
          issue: 'No summary sheet found',
          field: 'summary_sheets',
          type: 'missing'
        })
      } else {
        // Check if summary sheets have placeholder content
        summarySheets.forEach((sheet: any) => {
          const content = JSON.stringify(sheet)
          if (content.toLowerCase().includes('placeholder') ||
              content.includes('TODO') ||
              content.toLowerCase().includes('coming soon') ||
              !sheet.key_concepts || sheet.key_concepts.length === 0) {
            issues.push({
              id: sheet.id,
              path: `${fullPath} (Summary: ${sheet.title})`,
              issue: 'Placeholder or empty summary sheet',
              field: 'summary_sheets',
              type: 'placeholder'
            })
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalTopics: topics?.length || 0,
      issuesCount: issues.length,
      issues: issues.sort((a, b) => a.path.localeCompare(b.path))
    })

  } catch (error) {
    console.error('Error checking content:', error)
    return NextResponse.json(
      { error: 'Failed to check content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
