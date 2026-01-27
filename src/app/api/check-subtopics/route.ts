import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get all topics
    const { data: topics } = await supabase
      .from('topics')
      .select('id, name, slug, subjects(name, slug)')
      .order('name')

    const issues = []

    for (const topic of topics || []) {
      // Get subtopics for this topic
      const { data: subtopics } = await supabase
        .from('subtopics')
        .select('id, name, slug, description, learning_objectives')
        .eq('topic_id', topic.id)
        .order('order_index')

      const subjectName = (topic.subjects as any)?.name || 'Unknown'
      const fullPath = `${subjectName} > ${topic.name}`

      if (!subtopics || subtopics.length === 0) {
        issues.push({
          type: 'no_subtopics',
          path: fullPath,
          topicId: topic.id,
          topicSlug: topic.slug,
          subjectSlug: (topic.subjects as any)?.slug
        })
      } else {
        // Check each subtopic for placeholder content
        subtopics.forEach((subtopic: any) => {
          const hasPlaceholderDescription = !subtopic.description ||
            subtopic.description.toLowerCase().includes('placeholder') ||
            subtopic.description.toLowerCase().includes('coming soon') ||
            subtopic.description.includes('TODO')

          const hasNoObjectives = !subtopic.learning_objectives ||
            subtopic.learning_objectives.length === 0

          if (hasPlaceholderDescription || hasNoObjectives) {
            issues.push({
              type: 'placeholder_subtopic',
              path: `${fullPath} > ${subtopic.name}`,
              subtopicId: subtopic.id,
              subtopicName: subtopic.name,
              topicSlug: topic.slug,
              subjectSlug: (topic.subjects as any)?.slug,
              issues: {
                placeholderDescription: hasPlaceholderDescription,
                noObjectives: hasNoObjectives
              }
            })
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalTopics: topics?.length || 0,
      issuesCount: issues.length,
      topicsWithNoSubtopics: issues.filter(i => i.type === 'no_subtopics').length,
      subtopicsWithPlaceholders: issues.filter(i => i.type === 'placeholder_subtopic').length,
      issues: issues.sort((a, b) => a.path.localeCompare(b.path))
    })

  } catch (error) {
    console.error('Error checking subtopics:', error)
    return NextResponse.json(
      { error: 'Failed to check subtopics' },
      { status: 500 }
    )
  }
}
