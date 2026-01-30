const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyContent() {
  console.log('🔍 Verifying content accessibility...\n');

  // Get all subtopics with their relationships
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select('id, name, topics(name, subjects(name))');

  console.log(`📊 Total subtopics: ${subtopics?.length || 0}\n`);

  let stats = {
    total: subtopics?.length || 0,
    withFlashcards: 0,
    withQuestions: 0,
    withRecall: 0,
    fullyPopulated: 0,
    missingContent: []
  };

  for (const subtopic of subtopics || []) {
    const topic = subtopic.topics;
    const subject = topic?.subjects;

    // Check content
    const { data: flashcards } = await supabase
      .from('flashcards')
      .select('id')
      .eq('subtopic_id', subtopic.id)
      .limit(1);

    const { data: questions } = await supabase
      .from('practice_questions')
      .select('id')
      .eq('subtopic_id', subtopic.id)
      .limit(1);

    const { data: recall } = await supabase
      .from('recall_prompts')
      .select('id')
      .eq('subtopic_id', subtopic.id)
      .limit(1);

    const hasFlashcards = flashcards && flashcards.length > 0;
    const hasQuestions = questions && questions.length > 0;
    const hasRecall = recall && recall.length > 0;

    if (hasFlashcards) stats.withFlashcards++;
    if (hasQuestions) stats.withQuestions++;
    if (hasRecall) stats.withRecall++;

    if (hasFlashcards && hasQuestions && hasRecall) {
      stats.fullyPopulated++;
    } else {
      stats.missingContent.push({
        subject: subject?.name || 'Unknown',
        topic: topic?.name || 'Unknown',
        subtopic: subtopic.name,
        missing: [
          !hasFlashcards ? 'flashcards' : null,
          !hasQuestions ? 'questions' : null,
          !hasRecall ? 'recall' : null
        ].filter(Boolean)
      });
    }
  }

  console.log('='.repeat(70));
  console.log('📊 CONTENT VERIFICATION RESULTS');
  console.log('='.repeat(70));
  console.log(`Total subtopics: ${stats.total}`);
  console.log(`Subtopics with flashcards: ${stats.withFlashcards} (${Math.round(stats.withFlashcards / stats.total * 100)}%)`);
  console.log(`Subtopics with practice questions: ${stats.withQuestions} (${Math.round(stats.withQuestions / stats.total * 100)}%)`);
  console.log(`Subtopics with recall prompts: ${stats.withRecall} (${Math.round(stats.withRecall / stats.total * 100)}%)`);
  console.log(`Fully populated subtopics: ${stats.fullyPopulated} (${Math.round(stats.fullyPopulated / stats.total * 100)}%)`);
  console.log('='.repeat(70));

  if (stats.missingContent.length > 0) {
    console.log(`\n⚠️  ${stats.missingContent.length} subtopics still missing content:`);
    stats.missingContent.slice(0, 10).forEach(item => {
      console.log(`  - ${item.subject} > ${item.topic} > ${item.subtopic}`);
      console.log(`    Missing: ${item.missing.join(', ')}`);
    });
    if (stats.missingContent.length > 10) {
      console.log(`  ... and ${stats.missingContent.length - 10} more`);
    }
  } else {
    console.log('\n✅ All subtopics have complete content!');
  }

  // Check for "Practice questions not yet available" scenarios
  console.log('\n🔍 Checking topics that would show "not yet available" messages...');

  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, subjects(name)');

  let topicsWithoutContent = [];

  for (const topic of topics || []) {
    // Check if topic has any subtopics with content
    const { data: subtopicsForTopic } = await supabase
      .from('subtopics')
      .select('id')
      .eq('topic_id', topic.id);

    if (!subtopicsForTopic || subtopicsForTopic.length === 0) {
      topicsWithoutContent.push({
        subject: topic.subjects?.name || 'Unknown',
        topic: topic.name,
        reason: 'No subtopics'
      });
      continue;
    }

    // Check if any subtopic has practice questions
    const { data: hasQuestions } = await supabase
      .from('practice_questions')
      .select('id')
      .in('subtopic_id', subtopicsForTopic.map(s => s.id))
      .limit(1);

    if (!hasQuestions || hasQuestions.length === 0) {
      topicsWithoutContent.push({
        subject: topic.subjects?.name || 'Unknown',
        topic: topic.name,
        reason: 'No practice questions in any subtopic'
      });
    }
  }

  if (topicsWithoutContent.length > 0) {
    console.log(`\n⚠️  ${topicsWithoutContent.length} topics would show "not yet available":`);
    topicsWithoutContent.forEach(item => {
      console.log(`  - ${item.subject} > ${item.topic} (${item.reason})`);
    });
  } else {
    console.log('\n✅ All topics have accessible content!');
  }

  console.log('\n' + '='.repeat(70));
}

verifyContent().catch(console.error);
