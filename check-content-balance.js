require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkContentBalance() {
  console.log('📊 Checking content distribution across all subtopics...\n');

  // Get all subtopics with their content counts
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select(`
      id,
      name,
      topics!inner(name, subjects!inner(name))
    `)
    .order('name');

  if (!subtopics) {
    console.error('Failed to fetch subtopics');
    return;
  }

  console.log(`Total subtopics: ${subtopics.length}\n`);

  const results = [];
  const issues = [];

  for (const subtopic of subtopics) {
    // Count flashcard sets
    const { count: flashcardSets } = await supabase
      .from('flashcard_sets')
      .select('*', { count: 'exact', head: true })
      .eq('subtopic_id', subtopic.id);

    // Count flashcards
    const { data: sets } = await supabase
      .from('flashcard_sets')
      .select('id')
      .eq('subtopic_id', subtopic.id);

    let flashcardCount = 0;
    if (sets && sets.length > 0) {
      const { count } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('flashcard_set_id', sets[0].id);
      flashcardCount = count || 0;
    }

    // Count practice questions
    const { count: practiceCount } = await supabase
      .from('practice_questions')
      .select('*', { count: 'exact', head: true })
      .eq('subtopic_id', subtopic.id);

    // Count recall prompts
    const { count: recallCount } = await supabase
      .from('recall_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('subtopic_id', subtopic.id);

    const result = {
      subject: subtopic.topics.subjects.name,
      topic: subtopic.topics.name,
      subtopic: subtopic.name,
      flashcards: flashcardCount,
      practice: practiceCount || 0,
      recall: recallCount || 0
    };

    results.push(result);

    // Flag issues
    if (flashcardCount === 0 || practiceCount === 0 || recallCount === 0) {
      issues.push(result);
    }
  }

  // Show statistics
  console.log('📈 Content Statistics:\n');
  const flashcardCounts = results.map(r => r.flashcards);
  const practiceCounts = results.map(r => r.practice);
  const recallCounts = results.map(r => r.recall);

  console.log('Flashcards per subtopic:');
  console.log(`  Min: ${Math.min(...flashcardCounts)}`);
  console.log(`  Max: ${Math.max(...flashcardCounts)}`);
  console.log(`  Avg: ${(flashcardCounts.reduce((a, b) => a + b, 0) / flashcardCounts.length).toFixed(1)}`);

  console.log('\nPractice Questions per subtopic:');
  console.log(`  Min: ${Math.min(...practiceCounts)}`);
  console.log(`  Max: ${Math.max(...practiceCounts)}`);
  console.log(`  Avg: ${(practiceCounts.reduce((a, b) => a + b, 0) / practiceCounts.length).toFixed(1)}`);

  console.log('\nRecall Prompts per subtopic:');
  console.log(`  Min: ${Math.min(...recallCounts)}`);
  console.log(`  Max: ${Math.max(...recallCounts)}`);
  console.log(`  Avg: ${(recallCounts.reduce((a, b) => a + b, 0) / recallCounts.length).toFixed(1)}`);

  // Show extreme imbalances
  console.log('\n\n⚠️  Subtopics with 10+ recall prompts:\n');
  const highRecall = results.filter(r => r.recall >= 10).sort((a, b) => b.recall - a.recall);
  highRecall.slice(0, 10).forEach(r => {
    console.log(`  ${r.subject} → ${r.topic} → ${r.subtopic}: ${r.recall} recall prompts`);
  });

  console.log('\n\n❌ Subtopics with MISSING content:\n');
  if (issues.length > 0) {
    issues.slice(0, 20).forEach(r => {
      const missing = [];
      if (r.flashcards === 0) missing.push('flashcards');
      if (r.practice === 0) missing.push('practice');
      if (r.recall === 0) missing.push('recall');
      console.log(`  ${r.subject} → ${r.topic} → ${r.subtopic}`);
      console.log(`    Missing: ${missing.join(', ')}`);
      console.log(`    Has: ${r.flashcards} flashcards, ${r.practice} practice, ${r.recall} recall\n`);
    });
    console.log(`\n  Total subtopics with missing content: ${issues.length}`);
  } else {
    console.log('  ✅ No subtopics with missing content!');
  }
}

checkContentBalance();
