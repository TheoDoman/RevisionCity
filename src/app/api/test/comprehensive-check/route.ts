import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      subjects: [] as any[],
      summary: {
        totalSubjects: 0,
        totalTopics: 0,
        totalSubtopics: 0,
        revisionMethodCoverage: {
          notes: { total: 0, working: 0, failed: 0, missing: 0 },
          flashcards: { total: 0, working: 0, failed: 0, missing: 0 },
          quizzes: { total: 0, working: 0, failed: 0, missing: 0 },
          practice: { total: 0, working: 0, failed: 0, missing: 0 },
          recall: { total: 0, working: 0, failed: 0, missing: 0 },
          mindMaps: { total: 0, working: 0, failed: 0, missing: 0 },
          summaries: { total: 0, working: 0, failed: 0, missing: 0 }
        },
        issues: [] as string[]
      }
    }

    // Get all subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (subjectsError) throw subjectsError
    if (!subjects || subjects.length === 0) {
      throw new Error('No subjects found in database')
    }

    report.summary.totalSubjects = subjects.length

    // Check each subject
    for (const subject of subjects) {
      const subjectReport = {
        id: subject.id,
        name: subject.name,
        slug: subject.slug,
        topics: [] as any[]
      }

      // Get topics for this subject
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subject.id)
        .order('name')

      if (topicsError) {
        report.summary.issues.push(`Error loading topics for ${subject.name}: ${topicsError.message}`)
        continue
      }

      if (!topics || topics.length === 0) {
        report.summary.issues.push(`Subject ${subject.name} has no topics`)
        continue
      }

      report.summary.totalTopics += topics.length

      // Check each topic
      for (const topic of topics) {
        const topicReport = {
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
          subtopics: [] as any[]
        }

        // Get subtopics for this topic
        const { data: subtopics, error: subtopicsError } = await supabase
          .from('subtopics')
          .select('*')
          .eq('topic_id', topic.id)
          .order('order_index')

        if (subtopicsError) {
          report.summary.issues.push(`Error loading subtopics for ${topic.name}: ${subtopicsError.message}`)
          continue
        }

        if (!subtopics || subtopics.length === 0) {
          report.summary.issues.push(`Topic ${subject.name} > ${topic.name} has no subtopics`)
          continue
        }

        report.summary.totalSubtopics += subtopics.length

        // Check each subtopic and its revision methods
        for (const subtopic of subtopics) {
          const subtopicReport = {
            id: subtopic.id,
            name: subtopic.name,
            slug: subtopic.slug,
            revisionMethods: {
              notes: { status: 'unchecked', count: 0 },
              flashcards: { status: 'unchecked', count: 0 },
              quizzes: { status: 'unchecked', count: 0 },
              practice: { status: 'unchecked', count: 0 },
              recall: { status: 'unchecked', count: 0 },
              mindMaps: { status: 'unchecked', hasMindMap: false },
              summaries: { status: 'unchecked', hasSummary: false }
            }
          }

          // Check Notes
          report.summary.revisionMethodCoverage.notes.total++
          const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('subtopic_id', subtopic.id)

          if (notesError) {
            subtopicReport.revisionMethods.notes.status = 'error'
            report.summary.revisionMethodCoverage.notes.failed++
            report.summary.issues.push(`Notes error for ${subtopic.name}: ${notesError.message}`)
          } else if (!notes || notes.length === 0) {
            subtopicReport.revisionMethods.notes.status = 'missing'
            report.summary.revisionMethodCoverage.notes.missing++
          } else {
            subtopicReport.revisionMethods.notes.status = 'ok'
            subtopicReport.revisionMethods.notes.count = notes.length
            report.summary.revisionMethodCoverage.notes.working++
          }

          // Check Flashcards
          report.summary.revisionMethodCoverage.flashcards.total++
          const { data: flashcards, error: flashcardsError } = await supabase
            .from('flashcards')
            .select('*')
            .eq('subtopic_id', subtopic.id)

          if (flashcardsError) {
            subtopicReport.revisionMethods.flashcards.status = 'error'
            report.summary.revisionMethodCoverage.flashcards.failed++
            report.summary.issues.push(`Flashcards error for ${subtopic.name}: ${flashcardsError.message}`)
          } else if (!flashcards || flashcards.length === 0) {
            subtopicReport.revisionMethods.flashcards.status = 'missing'
            report.summary.revisionMethodCoverage.flashcards.missing++
          } else {
            subtopicReport.revisionMethods.flashcards.status = 'ok'
            subtopicReport.revisionMethods.flashcards.count = flashcards.length
            report.summary.revisionMethodCoverage.flashcards.working++
          }

          // Check Quiz Questions
          report.summary.revisionMethodCoverage.quizzes.total++
          const { data: quizzes, error: quizzesError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('subtopic_id', subtopic.id)

          if (quizzesError) {
            subtopicReport.revisionMethods.quizzes.status = 'error'
            report.summary.revisionMethodCoverage.quizzes.failed++
            report.summary.issues.push(`Quiz error for ${subtopic.name}: ${quizzesError.message}`)
          } else if (!quizzes || quizzes.length === 0) {
            subtopicReport.revisionMethods.quizzes.status = 'missing'
            report.summary.revisionMethodCoverage.quizzes.missing++
          } else {
            subtopicReport.revisionMethods.quizzes.status = 'ok'
            subtopicReport.revisionMethods.quizzes.count = quizzes.length
            report.summary.revisionMethodCoverage.quizzes.working++
          }

          // Check Practice Questions
          report.summary.revisionMethodCoverage.practice.total++
          const { data: practice, error: practiceError } = await supabase
            .from('practice_questions')
            .select('*')
            .eq('subtopic_id', subtopic.id)

          if (practiceError) {
            subtopicReport.revisionMethods.practice.status = 'error'
            report.summary.revisionMethodCoverage.practice.failed++
            report.summary.issues.push(`Practice error for ${subtopic.name}: ${practiceError.message}`)
          } else if (!practice || practice.length === 0) {
            subtopicReport.revisionMethods.practice.status = 'missing'
            report.summary.revisionMethodCoverage.practice.missing++
          } else {
            subtopicReport.revisionMethods.practice.status = 'ok'
            subtopicReport.revisionMethods.practice.count = practice.length
            report.summary.revisionMethodCoverage.practice.working++
          }

          // Check Active Recall
          report.summary.revisionMethodCoverage.recall.total++
          const { data: recall, error: recallError } = await supabase
            .from('recall_prompts')
            .select('*')
            .eq('subtopic_id', subtopic.id)

          if (recallError) {
            subtopicReport.revisionMethods.recall.status = 'error'
            report.summary.revisionMethodCoverage.recall.failed++
            report.summary.issues.push(`Recall error for ${subtopic.name}: ${recallError.message}`)
          } else if (!recall || recall.length === 0) {
            subtopicReport.revisionMethods.recall.status = 'missing'
            report.summary.revisionMethodCoverage.recall.missing++
          } else {
            subtopicReport.revisionMethods.recall.status = 'ok'
            subtopicReport.revisionMethods.recall.count = recall.length
            report.summary.revisionMethodCoverage.recall.working++
          }

          // Check Mind Maps (at topic level)
          report.summary.revisionMethodCoverage.mindMaps.total++
          const { data: mindMaps, error: mindMapsError } = await supabase
            .from('mind_maps')
            .select('*')
            .eq('topic_id', topic.id)

          if (mindMapsError) {
            subtopicReport.revisionMethods.mindMaps.status = 'error'
            report.summary.revisionMethodCoverage.mindMaps.failed++
            report.summary.issues.push(`Mind map error for ${topic.name}: ${mindMapsError.message}`)
          } else if (!mindMaps || mindMaps.length === 0) {
            subtopicReport.revisionMethods.mindMaps.status = 'missing'
            report.summary.revisionMethodCoverage.mindMaps.missing++
          } else {
            subtopicReport.revisionMethods.mindMaps.status = 'ok'
            subtopicReport.revisionMethods.mindMaps.hasMindMap = true
            report.summary.revisionMethodCoverage.mindMaps.working++
          }

          // Check Summary Sheets (at topic level)
          report.summary.revisionMethodCoverage.summaries.total++
          const { data: summaries, error: summariesError } = await supabase
            .from('summary_sheets')
            .select('*')
            .eq('topic_id', topic.id)

          if (summariesError) {
            subtopicReport.revisionMethods.summaries.status = 'error'
            report.summary.revisionMethodCoverage.summaries.failed++
            report.summary.issues.push(`Summary error for ${topic.name}: ${summariesError.message}`)
          } else if (!summaries || summaries.length === 0) {
            subtopicReport.revisionMethods.summaries.status = 'missing'
            report.summary.revisionMethodCoverage.summaries.missing++
          } else {
            subtopicReport.revisionMethods.summaries.status = 'ok'
            subtopicReport.revisionMethods.summaries.hasSummary = true
            report.summary.revisionMethodCoverage.summaries.working++
          }

          topicReport.subtopics.push(subtopicReport)
        }

        subjectReport.topics.push(topicReport)
      }

      report.subjects.push(subjectReport)
    }

    // Calculate percentages
    const calculatePercentage = (working: number, total: number) => {
      return total > 0 ? Math.round((working / total) * 100) : 0
    }

    const summaryWithPercentages = {
      ...report.summary,
      revisionMethodCoverage: {
        notes: {
          ...report.summary.revisionMethodCoverage.notes,
          percentage: calculatePercentage(
            report.summary.revisionMethodCoverage.notes.working,
            report.summary.revisionMethodCoverage.notes.total
          )
        },
        flashcards: {
          ...report.summary.revisionMethodCoverage.flashcards,
          percentage: calculatePercentage(
            report.summary.revisionMethodCoverage.flashcards.working,
            report.summary.revisionMethodCoverage.flashcards.total
          )
        },
        quizzes: {
          ...report.summary.revisionMethodCoverage.quizzes,
          percentage: calculatePercentage(
            report.summary.revisionMethodCoverage.quizzes.working,
            report.summary.revisionMethodCoverage.quizzes.total
          )
        },
        practice: {
          ...report.summary.revisionMethodCoverage.practice,
          percentage: calculatePercentage(
            report.summary.revisionMethodCoverage.practice.working,
            report.summary.revisionMethodCoverage.practice.total
          )
        },
        recall: {
          ...report.summary.revisionMethodCoverage.recall,
          percentage: calculatePercentage(
            report.summary.revisionMethodCoverage.recall.working,
            report.summary.revisionMethodCoverage.recall.total
          )
        },
        mindMaps: {
          ...report.summary.revisionMethodCoverage.mindMaps,
          percentage: calculatePercentage(
            report.summary.revisionMethodCoverage.mindMaps.working,
            report.summary.revisionMethodCoverage.mindMaps.total
          )
        },
        summaries: {
          ...report.summary.revisionMethodCoverage.summaries,
          percentage: calculatePercentage(
            report.summary.revisionMethodCoverage.summaries.working,
            report.summary.revisionMethodCoverage.summaries.total
          )
        }
      }
    }

    report.summary = summaryWithPercentages

    return NextResponse.json(report, { status: 200 })
  } catch (error: any) {
    console.error('Comprehensive check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run comprehensive check' },
      { status: 500 }
    )
  }
}
