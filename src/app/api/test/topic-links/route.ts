import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Fetch all subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, slug')
      .order('name')

    if (subjectsError) throw subjectsError

    const results = []

    // For each subject, get all topics
    for (const subject of subjects || []) {
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('id, name, slug, subject_id')
        .eq('subject_id', subject.id)
        .order('order_index')

      if (topicsError) {
        results.push({
          subject: subject.name,
          error: topicsError.message
        })
        continue
      }

      // Get subtopic count for each topic
      for (const topic of topics || []) {
        const { count } = await supabase
          .from('subtopics')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id)

        results.push({
          subject: subject.name,
          subjectSlug: subject.slug,
          topic: topic.name,
          topicSlug: topic.slug,
          subtopicCount: count || 0,
          url: `/subject/${subject.slug}/${topic.slug}`
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalTopics: results.length,
      topics: results,
      summary: {
        totalSubjects: subjects?.length || 0,
        totalTopics: results.length,
        averageSubtopicsPerTopic: results.length > 0
          ? (results.reduce((sum, r) => sum + (r.subtopicCount || 0), 0) / results.length).toFixed(1)
          : 0
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
