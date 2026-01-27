import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('Starting comprehensive validation...')

    // Get ALL subtopics
    const { data: subtopics } = await supabase
      .from('subtopics')
      .select('id, name, slug, description, learning_objectives, topics(name, slug, subjects(name, slug))')

    const validation = {
      totalSubtopics: subtopics?.length || 0,
      validSubtopics: 0,
      issues: [] as any[],
      stats: {
        missingDescription: 0,
        missingObjectives: 0,
        missingNotes: 0,
        missingFlashcards: 0,
        missingQuizzes: 0,
        missingPractice: 0,
        missingRecall: 0,
        completelyEmpty: 0
      }
    }

    let checked = 0
    for (const subtopic of subtopics || []) {
      checked++
      if (checked % 50 === 0) {
        console.log(`Checked ${checked}/${validation.totalSubtopics} subtopics...`)
      }

      const subjectName = (subtopic.topics as any)?.subjects?.name || 'Unknown'
      const topicName = (subtopic.topics as any)?.name || 'Unknown'
      const path = `${subjectName} > ${topicName} > ${subtopic.name}`

      const subtopicIssues: string[] = []

      // Check description
      if (!subtopic.description || subtopic.description.trim() === '' ||
          subtopic.description.toLowerCase().includes('placeholder') ||
          subtopic.description.toLowerCase().includes('coming soon')) {
        subtopicIssues.push('Missing or placeholder description')
        validation.stats.missingDescription++
      }

      // Check learning objectives
      if (!subtopic.learning_objectives || subtopic.learning_objectives.length === 0) {
        subtopicIssues.push('No learning objectives')
        validation.stats.missingObjectives++
      }

      // Check content
      const { data: notes } = await supabase
        .from('notes')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const { data: flashcards } = await supabase
        .from('flashcards')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const { data: quizzes } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const { data: practice } = await supabase
        .from('practice_questions')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      const { data: recall } = await supabase
        .from('recall_prompts')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1)

      if (!notes || notes.length === 0) {
        subtopicIssues.push('No notes')
        validation.stats.missingNotes++
      }
      if (!flashcards || flashcards.length === 0) {
        subtopicIssues.push('No flashcards')
        validation.stats.missingFlashcards++
      }
      if (!quizzes || quizzes.length === 0) {
        subtopicIssues.push('No quiz questions')
        validation.stats.missingQuizzes++
      }
      if (!practice || practice.length === 0) {
        subtopicIssues.push('No practice questions')
        validation.stats.missingPractice++
      }
      if (!recall || recall.length === 0) {
        subtopicIssues.push('No recall prompts')
        validation.stats.missingRecall++
      }

      if (subtopicIssues.length >= 5) {
        validation.stats.completelyEmpty++
      }

      if (subtopicIssues.length > 0) {
        validation.issues.push({
          path,
          subtopicId: subtopic.id,
          subtopicSlug: subtopic.slug,
          topicSlug: (subtopic.topics as any)?.slug,
          subjectSlug: (subtopic.topics as any)?.subjects?.slug,
          issues: subtopicIssues
        })
      } else {
        validation.validSubtopics++
      }
    }

    console.log('Validation complete!')

    return NextResponse.json({
      success: true,
      validation,
      summary: {
        total: validation.totalSubtopics,
        valid: validation.validSubtopics,
        withIssues: validation.issues.length,
        percentageValid: ((validation.validSubtopics / validation.totalSubtopics) * 100).toFixed(1) + '%'
      }
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}
