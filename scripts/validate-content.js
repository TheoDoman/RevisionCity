#!/usr/bin/env node

/**
 * Validate Content - Quality Assurance Tool
 *
 * Usage:
 *   node scripts/validate-content.js
 *   node scripts/validate-content.js chemistry
 *   node scripts/validate-content.js --detailed
 *
 * Features:
 * - Checks all subtopics have complete content
 * - Verifies flashcard counts, quiz questions, etc.
 * - Generates report of what's missing
 * - Shows completion percentage per subject
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Expected content counts per subtopic
const EXPECTED_COUNTS = {
  notes: 1,
  flashcards: 8,
  quizQuestions: 10,
  practiceQuestions: 5,
  recallPrompts: 4
};

// Validate a single subtopic
async function validateSubtopic(subtopic) {
  const issues = [];
  const counts = {};

  // Check notes
  const { data: notes } = await supabase
    .from('notes')
    .select('id, content, key_points')
    .eq('subtopic_id', subtopic.id);

  counts.notes = notes?.length || 0;

  if (counts.notes === 0) {
    issues.push('Missing notes');
  } else if (notes[0].content.length < 500) {
    issues.push('Notes too short (<500 chars)');
  } else if (!notes[0].key_points || notes[0].key_points.length < 3) {
    issues.push('Insufficient key points');
  }

  // Check flashcards
  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('id, difficulty')
    .eq('subtopic_id', subtopic.id);

  counts.flashcards = flashcards?.length || 0;

  if (counts.flashcards < EXPECTED_COUNTS.flashcards) {
    issues.push(`Only ${counts.flashcards}/8 flashcards`);
  }

  // Check difficulty distribution
  if (flashcards && flashcards.length > 0) {
    const difficulties = { easy: 0, medium: 0, hard: 0 };
    flashcards.forEach(f => {
      difficulties[f.difficulty] = (difficulties[f.difficulty] || 0) + 1;
    });

    if (difficulties.easy === 0) issues.push('No easy flashcards');
    if (difficulties.hard === 0) issues.push('No hard flashcards');
  }

  // Check quiz questions
  const { data: quizQuestions } = await supabase
    .from('quiz_questions')
    .select('id, question_type, explanation')
    .eq('subtopic_id', subtopic.id);

  counts.quizQuestions = quizQuestions?.length || 0;

  if (counts.quizQuestions < EXPECTED_COUNTS.quizQuestions) {
    issues.push(`Only ${counts.quizQuestions}/10 quiz questions`);
  }

  // Check for explanations
  if (quizQuestions) {
    const missingExplanations = quizQuestions.filter(q => !q.explanation).length;
    if (missingExplanations > 0) {
      issues.push(`${missingExplanations} quiz questions missing explanations`);
    }
  }

  // Check practice questions
  const { data: practiceQuestions } = await supabase
    .from('practice_questions')
    .select('id, marks, mark_scheme, example_answer')
    .eq('subtopic_id', subtopic.id);

  counts.practiceQuestions = practiceQuestions?.length || 0;

  if (counts.practiceQuestions < EXPECTED_COUNTS.practiceQuestions) {
    issues.push(`Only ${counts.practiceQuestions}/5 practice questions`);
  }

  // Check for mark schemes
  if (practiceQuestions) {
    const missingMarkSchemes = practiceQuestions.filter(
      p => !p.mark_scheme || p.mark_scheme.length === 0
    ).length;
    if (missingMarkSchemes > 0) {
      issues.push(`${missingMarkSchemes} practice questions missing mark schemes`);
    }
  }

  // Check recall prompts
  const { data: recallPrompts } = await supabase
    .from('recall_prompts')
    .select('id, hints, model_answer, key_points_to_include')
    .eq('subtopic_id', subtopic.id);

  counts.recallPrompts = recallPrompts?.length || 0;

  if (counts.recallPrompts < EXPECTED_COUNTS.recallPrompts) {
    issues.push(`Only ${counts.recallPrompts}/4 recall prompts`);
  }

  // Calculate completion percentage
  const totalExpected = Object.values(EXPECTED_COUNTS).reduce((a, b) => a + b, 0);
  const totalActual = Object.values(counts).reduce((a, b) => a + b, 0);
  const completionPercent = Math.round((totalActual / totalExpected) * 100);

  return {
    subtopic,
    counts,
    issues,
    completionPercent,
    isComplete: issues.length === 0 && completionPercent >= 100
  };
}

// Validate a topic
async function validateTopic(topic, detailed = false) {
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select('*')
    .eq('topic_id', topic.id)
    .order('order_index');

  if (!subtopics || subtopics.length === 0) {
    return {
      topic,
      subtopicResults: [],
      totalSubtopics: 0,
      completeSubtopics: 0,
      completionPercent: 0
    };
  }

  const results = [];

  for (const subtopic of subtopics) {
    const result = await validateSubtopic(subtopic);
    results.push(result);
  }

  const completeCount = results.filter(r => r.isComplete).length;
  const completionPercent = Math.round((completeCount / results.length) * 100);

  return {
    topic,
    subtopicResults: results,
    totalSubtopics: subtopics.length,
    completeSubtopics: completeCount,
    completionPercent
  };
}

// Validate a subject
async function validateSubject(subject, detailed = false) {
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subject.id)
    .order('order_index');

  if (!topics || topics.length === 0) {
    return {
      subject,
      topicResults: [],
      totalTopics: 0,
      totalSubtopics: 0,
      completeSubtopics: 0,
      completionPercent: 0
    };
  }

  const results = [];
  let totalSubtopics = 0;
  let completeSubtopics = 0;

  for (const topic of topics) {
    const result = await validateTopic(topic, detailed);
    results.push(result);
    totalSubtopics += result.totalSubtopics;
    completeSubtopics += result.completeSubtopics;
  }

  const completionPercent = totalSubtopics > 0
    ? Math.round((completeSubtopics / totalSubtopics) * 100)
    : 0;

  return {
    subject,
    topicResults: results,
    totalTopics: topics.length,
    totalSubtopics,
    completeSubtopics,
    completionPercent
  };
}

// Print validation report
function printReport(subjectResults, detailed = false) {
  console.log('\n📊 CONTENT VALIDATION REPORT\n');
  console.log('═'.repeat(80));

  for (const subjectResult of subjectResults) {
    const { subject, topicResults, totalSubtopics, completeSubtopics, completionPercent } = subjectResult;

    const statusIcon = completionPercent === 100 ? '✅' : completionPercent > 0 ? '🟡' : '❌';

    console.log(`\n${statusIcon} ${subject.name}`);
    console.log(`   Progress: ${completeSubtopics}/${totalSubtopics} subtopics (${completionPercent}%)`);

    if (topicResults.length === 0) {
      console.log('   ⚠️  No topics found');
      continue;
    }

    for (const topicResult of topicResults) {
      const { topic, subtopicResults, completeSubtopics: topicComplete, totalSubtopics: topicTotal, completionPercent: topicPercent } = topicResult;

      if (topicTotal === 0) {
        console.log(`   📖 ${topic.name}: ⚠️  No subtopics`);
        continue;
      }

      const topicIcon = topicPercent === 100 ? '✅' : topicPercent > 0 ? '🟡' : '❌';
      console.log(`   📖 ${topic.name}: ${topicIcon} ${topicComplete}/${topicTotal} (${topicPercent}%)`);

      if (detailed) {
        for (const subtopicResult of subtopicResults) {
          const { subtopic, counts, issues, isComplete } = subtopicResult;
          const icon = isComplete ? '✅' : '⚠️ ';

          console.log(`      ${icon} ${subtopic.name}`);

          if (!isComplete) {
            console.log(`         N:${counts.notes} F:${counts.flashcards} Q:${counts.quizQuestions} P:${counts.practiceQuestions} R:${counts.recallPrompts}`);
            if (issues.length > 0) {
              issues.forEach(issue => console.log(`         - ${issue}`));
            }
          }
        }
      }
    }
  }

  console.log('\n' + '═'.repeat(80));

  // Summary
  const totalSubtopics = subjectResults.reduce((sum, s) => sum + s.totalSubtopics, 0);
  const totalComplete = subjectResults.reduce((sum, s) => sum + s.completeSubtopics, 0);
  const overallPercent = totalSubtopics > 0 ? Math.round((totalComplete / totalSubtopics) * 100) : 0;

  console.log('\n📈 OVERALL PROGRESS');
  console.log(`   ${totalComplete}/${totalSubtopics} subtopics complete (${overallPercent}%)`);

  // Subjects needing work
  const incomplete = subjectResults.filter(s => s.completionPercent < 100);
  if (incomplete.length > 0) {
    console.log('\n🎯 SUBJECTS NEEDING WORK:');
    incomplete.forEach(s => {
      console.log(`   - ${s.subject.name} (${s.completionPercent}%)`);
    });
  }

  // Missing content stats
  const missingByType = {
    notes: 0,
    flashcards: 0,
    quizQuestions: 0,
    practiceQuestions: 0,
    recallPrompts: 0
  };

  subjectResults.forEach(sr => {
    sr.topicResults.forEach(tr => {
      tr.subtopicResults.forEach(str => {
        Object.keys(EXPECTED_COUNTS).forEach(type => {
          const missing = EXPECTED_COUNTS[type] - str.counts[type];
          if (missing > 0) {
            missingByType[type] += missing;
          }
        });
      });
    });
  });

  const totalMissing = Object.values(missingByType).reduce((a, b) => a + b, 0);
  if (totalMissing > 0) {
    console.log('\n📋 MISSING CONTENT:');
    Object.entries(missingByType).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   - ${count} ${type}`);
      }
    });
  }

  console.log('');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const targetSubject = args.find(a => !a.startsWith('--'))?.toLowerCase();
  const detailed = args.includes('--detailed');

  console.log('🔍 Content Validation Tool\n');

  // Get subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('name');

  if (!subjects || subjects.length === 0) {
    console.error('❌ No subjects found');
    return;
  }

  const subjectsToValidate = targetSubject
    ? subjects.filter(s => s.slug === targetSubject)
    : subjects;

  if (subjectsToValidate.length === 0) {
    console.error(`❌ Subject "${targetSubject}" not found`);
    return;
  }

  console.log(`Validating ${subjectsToValidate.length} subject(s)...`);
  if (detailed) {
    console.log('Mode: Detailed (showing all issues)');
  }

  const results = [];

  for (const subject of subjectsToValidate) {
    const result = await validateSubject(subject, detailed);
    results.push(result);
  }

  printReport(results, detailed);
}

main().catch(console.error);
