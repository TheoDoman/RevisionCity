#!/usr/bin/env node

/**
 * VALIDATE COMPLETENESS - Content Quality Assurance
 *
 * Validates that all subtopics have complete, high-quality content
 * Checks for placeholders, missing content, and incorrect counts
 *
 * Usage: node scripts/validate-completeness.js <subject-slug>
 * Example: node scripts/validate-completeness.js chemistry
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Content requirements
const REQUIREMENTS = {
  flashcards: {
    count: 8,
    difficulties: { easy: 3, medium: 3, hard: 2 }
  },
  quizQuestions: {
    count: 10,
    types: { multiple_choice: 7, true_false: 3 }
  },
  practiceQuestions: {
    count: 5,
    minMarks: 2,
    maxMarks: 10
  },
  recallPrompts: {
    count: 4,
    minHints: 2
  },
  notes: {
    minWords: 500,
    minKeyPoints: 5
  }
};

// Placeholder detection patterns
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /placeholder/i,
  /\[insert.*?\]/i,
  /\[todo.*?\]/i,
  /\[tbd\]/i,
  /coming soon/i,
  /under construction/i,
  /\[fill.*?\]/i,
  /xxx+/i,
  /yyy+/i,
  /zzz+/i
];

// Validation functions
function hasPlaceholder(text) {
  if (!text) return false;
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text));
}

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function validateNotes(notes) {
  const issues = [];

  if (!notes) {
    return { valid: false, issues: ['Notes missing'] };
  }

  // Check for placeholders
  if (hasPlaceholder(notes.title)) {
    issues.push('Title contains placeholder text');
  }
  if (hasPlaceholder(notes.content)) {
    issues.push('Content contains placeholder text');
  }

  // Check word count
  const wordCount = countWords(notes.content);
  if (wordCount < REQUIREMENTS.notes.minWords) {
    issues.push(`Content too short: ${wordCount} words (minimum ${REQUIREMENTS.notes.minWords})`);
  }

  // Check key points
  if (!notes.key_points || notes.key_points.length < REQUIREMENTS.notes.minKeyPoints) {
    issues.push(`Insufficient key points: ${notes.key_points?.length || 0} (minimum ${REQUIREMENTS.notes.minKeyPoints})`);
  }

  // Check for empty key points
  if (notes.key_points?.some(kp => !kp || kp.trim().length === 0)) {
    issues.push('Contains empty key points');
  }

  return {
    valid: issues.length === 0,
    issues,
    wordCount
  };
}

function validateFlashcards(flashcards) {
  const issues = [];

  if (!flashcards || flashcards.length === 0) {
    return { valid: false, issues: ['No flashcards found'] };
  }

  // Check count
  if (flashcards.length !== REQUIREMENTS.flashcards.count) {
    issues.push(`Incorrect count: ${flashcards.length} (expected ${REQUIREMENTS.flashcards.count})`);
  }

  // Check difficulty distribution
  const difficulties = flashcards.reduce((acc, card) => {
    acc[card.difficulty] = (acc[card.difficulty] || 0) + 1;
    return acc;
  }, {});

  Object.entries(REQUIREMENTS.flashcards.difficulties).forEach(([diff, expected]) => {
    const actual = difficulties[diff] || 0;
    if (actual !== expected) {
      issues.push(`Incorrect ${diff} count: ${actual} (expected ${expected})`);
    }
  });

  // Check for placeholders
  flashcards.forEach((card, i) => {
    if (hasPlaceholder(card.front)) {
      issues.push(`Card ${i + 1} front contains placeholder`);
    }
    if (hasPlaceholder(card.back)) {
      issues.push(`Card ${i + 1} back contains placeholder`);
    }
    if (!card.front || card.front.trim().length < 5) {
      issues.push(`Card ${i + 1} front too short`);
    }
    if (!card.back || card.back.trim().length < 10) {
      issues.push(`Card ${i + 1} back too short`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    count: flashcards.length,
    difficulties
  };
}

function validateQuizQuestions(questions) {
  const issues = [];

  if (!questions || questions.length === 0) {
    return { valid: false, issues: ['No quiz questions found'] };
  }

  // Check count
  if (questions.length !== REQUIREMENTS.quizQuestions.count) {
    issues.push(`Incorrect count: ${questions.length} (expected ${REQUIREMENTS.quizQuestions.count})`);
  }

  // Check type distribution
  const types = questions.reduce((acc, q) => {
    acc[q.question_type] = (acc[q.question_type] || 0) + 1;
    return acc;
  }, {});

  Object.entries(REQUIREMENTS.quizQuestions.types).forEach(([type, expected]) => {
    const actual = types[type] || 0;
    if (actual !== expected) {
      issues.push(`Incorrect ${type} count: ${actual} (expected ${expected})`);
    }
  });

  // Check each question
  questions.forEach((q, i) => {
    if (hasPlaceholder(q.question)) {
      issues.push(`Question ${i + 1} contains placeholder`);
    }
    if (!q.question || q.question.trim().length < 10) {
      issues.push(`Question ${i + 1} too short`);
    }
    if (!q.correct_answer) {
      issues.push(`Question ${i + 1} missing correct answer`);
    }
    if (!q.explanation || q.explanation.trim().length < 20) {
      issues.push(`Question ${i + 1} explanation too short`);
    }
    if (q.question_type === 'multiple_choice') {
      if (!q.options || q.options.length !== 4) {
        issues.push(`Question ${i + 1} should have 4 options`);
      }
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    count: questions.length,
    types
  };
}

function validatePracticeQuestions(questions) {
  const issues = [];

  if (!questions || questions.length === 0) {
    return { valid: false, issues: ['No practice questions found'] };
  }

  // Check count
  if (questions.length !== REQUIREMENTS.practiceQuestions.count) {
    issues.push(`Incorrect count: ${questions.length} (expected ${REQUIREMENTS.practiceQuestions.count})`);
  }

  // Check each question
  questions.forEach((q, i) => {
    if (hasPlaceholder(q.question)) {
      issues.push(`Question ${i + 1} contains placeholder`);
    }
    if (!q.question || q.question.trim().length < 20) {
      issues.push(`Question ${i + 1} too short`);
    }
    if (!q.marks || q.marks < REQUIREMENTS.practiceQuestions.minMarks) {
      issues.push(`Question ${i + 1} marks too low`);
    }
    if (!q.mark_scheme || q.mark_scheme.length === 0) {
      issues.push(`Question ${i + 1} missing mark scheme`);
    }
    if (!q.example_answer || q.example_answer.trim().length < 50) {
      issues.push(`Question ${i + 1} example answer too short`);
    }

    // Check mark scheme points
    if (q.mark_scheme) {
      const emptyPoints = q.mark_scheme.filter(p => !p || p.trim().length === 0);
      if (emptyPoints.length > 0) {
        issues.push(`Question ${i + 1} has empty mark scheme points`);
      }
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    count: questions.length
  };
}

function validateRecallPrompts(prompts) {
  const issues = [];

  if (!prompts || prompts.length === 0) {
    return { valid: false, issues: ['No recall prompts found'] };
  }

  // Check count
  if (prompts.length !== REQUIREMENTS.recallPrompts.count) {
    issues.push(`Incorrect count: ${prompts.length} (expected ${REQUIREMENTS.recallPrompts.count})`);
  }

  // Check each prompt
  prompts.forEach((p, i) => {
    if (hasPlaceholder(p.prompt)) {
      issues.push(`Prompt ${i + 1} contains placeholder`);
    }
    if (!p.prompt || p.prompt.trim().length < 20) {
      issues.push(`Prompt ${i + 1} too short`);
    }
    if (!p.hints || p.hints.length < REQUIREMENTS.recallPrompts.minHints) {
      issues.push(`Prompt ${i + 1} insufficient hints (minimum ${REQUIREMENTS.recallPrompts.minHints})`);
    }
    if (!p.model_answer || p.model_answer.trim().length < 50) {
      issues.push(`Prompt ${i + 1} model answer too short`);
    }
    if (!p.key_points_to_include || p.key_points_to_include.length < 3) {
      issues.push(`Prompt ${i + 1} insufficient key points`);
    }

    // Check for empty hints
    if (p.hints?.some(h => !h || h.trim().length === 0)) {
      issues.push(`Prompt ${i + 1} has empty hints`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    count: prompts.length
  };
}

async function validateSubtopic(subtopic) {
  const issues = [];
  const warnings = [];

  // Fetch all content for this subtopic
  const [
    { data: notes },
    { data: flashcards },
    { data: quizQuestions },
    { data: practiceQuestions },
    { data: recallPrompts }
  ] = await Promise.all([
    supabase.from('notes').select('*').eq('subtopic_id', subtopic.id).single(),
    supabase.from('flashcards').select('*').eq('subtopic_id', subtopic.id),
    supabase.from('quiz_questions').select('*').eq('subtopic_id', subtopic.id),
    supabase.from('practice_questions').select('*').eq('subtopic_id', subtopic.id),
    supabase.from('recall_prompts').select('*').eq('subtopic_id', subtopic.id)
  ]);

  // Validate each content type
  const notesValidation = validateNotes(notes);
  const flashcardsValidation = validateFlashcards(flashcards);
  const quizValidation = validateQuizQuestions(quizQuestions);
  const practiceValidation = validatePracticeQuestions(practiceQuestions);
  const recallValidation = validateRecallPrompts(recallPrompts);

  // Collect issues
  if (!notesValidation.valid) {
    issues.push(...notesValidation.issues.map(i => `Notes: ${i}`));
  }
  if (!flashcardsValidation.valid) {
    issues.push(...flashcardsValidation.issues.map(i => `Flashcards: ${i}`));
  }
  if (!quizValidation.valid) {
    issues.push(...quizValidation.issues.map(i => `Quiz: ${i}`));
  }
  if (!practiceValidation.valid) {
    issues.push(...practiceValidation.issues.map(i => `Practice: ${i}`));
  }
  if (!recallValidation.valid) {
    issues.push(...recallValidation.issues.map(i => `Recall: ${i}`));
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    content: {
      notes: notesValidation,
      flashcards: flashcardsValidation,
      quiz: quizValidation,
      practice: practiceValidation,
      recall: recallValidation
    }
  };
}

async function validateSubject(subjectSlug) {
  console.log(`\n🔍 Validating subject: ${subjectSlug}\n`);

  // Get subject
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', subjectSlug)
    .single();

  if (subjectError || !subject) {
    throw new Error(`Subject "${subjectSlug}" not found`);
  }

  console.log(`Subject: ${subject.name} (ID: ${subject.id})\n`);

  // Get all topics and subtopics
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select(`
      id,
      name,
      slug,
      subtopic_count
    `)
    .eq('subject_id', subject.id)
    .order('order_index');

  if (topicsError) {
    throw new Error(`Error fetching topics: ${topicsError.message}`);
  }

  console.log(`Topics found: ${topics.length}\n`);
  console.log('Validating content...\n');

  const results = {
    subject: subject.name,
    totalTopics: topics.length,
    totalSubtopics: 0,
    validSubtopics: 0,
    invalidSubtopics: 0,
    topics: []
  };

  // Validate each topic
  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Topic ${i + 1}/${topics.length}: ${topic.name}`);
    console.log('='.repeat(60));

    const { data: subtopics, error: subtopicsError } = await supabase
      .from('subtopics')
      .select('*')
      .eq('topic_id', topic.id)
      .order('order_index');

    if (subtopicsError) {
      console.error(`❌ Error fetching subtopics: ${subtopicsError.message}`);
      continue;
    }

    const topicResult = {
      name: topic.name,
      slug: topic.slug,
      subtopicCount: subtopics.length,
      validSubtopics: 0,
      invalidSubtopics: 0,
      subtopics: []
    };

    results.totalSubtopics += subtopics.length;

    // Validate each subtopic
    for (let j = 0; j < subtopics.length; j++) {
      const subtopic = subtopics[j];
      console.log(`\n   ${j + 1}. ${subtopic.name}`);
      console.log(`      Validating content...`);

      const validation = await validateSubtopic(subtopic);

      const subtopicResult = {
        name: subtopic.name,
        slug: subtopic.slug,
        valid: validation.valid,
        issues: validation.issues,
        warnings: validation.warnings,
        content: validation.content
      };

      topicResult.subtopics.push(subtopicResult);

      if (validation.valid) {
        console.log(`      ✅ Valid - All content complete`);
        topicResult.validSubtopics++;
        results.validSubtopics++;
      } else {
        console.log(`      ❌ Invalid - ${validation.issues.length} issues found`);
        validation.issues.forEach(issue => {
          console.log(`         - ${issue}`);
        });
        topicResult.invalidSubtopics++;
        results.invalidSubtopics++;
      }
    }

    results.topics.push(topicResult);
  }

  return results;
}

function printSummary(results) {
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(70) + '\n');

  console.log(`Subject: ${results.subject}`);
  console.log(`Total Topics: ${results.totalTopics}`);
  console.log(`Total Subtopics: ${results.totalSubtopics}\n`);

  const completeness = results.totalSubtopics > 0
    ? ((results.validSubtopics / results.totalSubtopics) * 100).toFixed(1)
    : 0;

  console.log(`✅ Valid Subtopics:   ${results.validSubtopics} (${completeness}%)`);
  console.log(`❌ Invalid Subtopics: ${results.invalidSubtopics}\n`);

  if (results.validSubtopics === results.totalSubtopics) {
    console.log('🎉 ALL CONTENT COMPLETE AND VALID! 🎉\n');
  } else {
    console.log('⚠️  ISSUES FOUND - Review details above\n');
  }

  console.log('TOPIC BREAKDOWN:');
  console.log('─'.repeat(70));

  results.topics.forEach((topic, i) => {
    const status = topic.validSubtopics === topic.subtopicCount ? '✅' : '❌';
    console.log(`${status} ${topic.name}: ${topic.validSubtopics}/${topic.subtopicCount} valid`);

    if (topic.invalidSubtopics > 0) {
      topic.subtopics
        .filter(st => !st.valid)
        .forEach(st => {
          console.log(`      ❌ ${st.name}: ${st.issues.length} issues`);
        });
    }
  });

  console.log('\n' + '='.repeat(70));

  if (results.invalidSubtopics === 0) {
    console.log('✅ VALIDATION PASSED - Ready for production');
  } else {
    console.log('❌ VALIDATION FAILED - Fix issues before deployment');
  }

  console.log('='.repeat(70) + '\n');
}

// Main execution
async function main() {
  const subjectSlug = process.argv[2];

  if (!subjectSlug) {
    console.error('❌ Error: Please provide a subject slug');
    console.error('Usage: node validate-completeness.js <subject-slug>');
    console.error('Example: node validate-completeness.js chemistry');
    process.exit(1);
  }

  console.log('\n🚀 VALIDATE COMPLETENESS - Quality Assurance');
  console.log('============================================');

  try {
    const results = await validateSubject(subjectSlug);
    printSummary(results);

    // Exit with error code if validation failed
    if (results.invalidSubtopics > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
