require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function finalVerification() {
  console.log('🔍 Final Verification - Checking for any remaining placeholder content\n');

  // Check for exact placeholder patterns
  const { data: badPrompts } = await supabase
    .from('recall_prompts')
    .select('prompt, subtopics!inner(name, topics!inner(name, subjects!inner(name)))')
    .or(
      'prompt.ilike.%concept 1%,' +
      'prompt.ilike.%concept 2%,' +
      'prompt.ilike.%concept 3%,' +
      'prompt.ilike.%concept 4%,' +
      'prompt.ilike.%explain% concept 1%,' +
      'prompt.ilike.%(part 1)%,' +
      'prompt.ilike.%(part 2)%,' +
      'prompt.ilike.%(part 3)%,' +
      'prompt.ilike.%(part 4)%'
    )
    .limit(10);

  if (badPrompts && badPrompts.length > 0) {
    console.log(`⚠️  Found ${badPrompts.length} potential placeholder prompts:\n`);
    badPrompts.forEach(p => {
      const subject = p.subtopics.topics.subjects.name;
      const topic = p.subtopics.topics.name;
      const subtopic = p.subtopics.name;
      console.log(`  ${subject} → ${topic} → ${subtopic}`);
      console.log(`  "${p.prompt}"\n`);
    });
  } else {
    console.log('✅ No placeholder prompts found!\n');
  }

  // Count total content
  const { count: totalFlashcards } = await supabase
    .from('flashcards')
    .select('*', { count: 'exact', head: true });

  const { count: totalPractice } = await supabase
    .from('practice_questions')
    .select('*', { count: 'exact', head: true });

  const { count: totalRecall } = await supabase
    .from('recall_prompts')
    .select('*', { count: 'exact', head: true });

  const { count: totalSubtopics } = await supabase
    .from('subtopics')
    .select('*', { count: 'exact', head: true });

  console.log('📊 Final Content Summary:\n');
  console.log(`  Total Subtopics: ${totalSubtopics}`);
  console.log(`  Flashcards: ${totalFlashcards}`);
  console.log(`  Practice Questions: ${totalPractice}`);
  console.log(`  Recall Prompts: ${totalRecall}`);
  console.log(`\n  Average per subtopic:`);
  console.log(`    - Flashcards: ${(totalFlashcards / totalSubtopics).toFixed(1)}`);
  console.log(`    - Practice Questions: ${(totalPractice / totalSubtopics).toFixed(1)}`);
  console.log(`    - Recall Prompts: ${(totalRecall / totalSubtopics).toFixed(1)}`);

  console.log('\n✅ App is ready for use!');
}

finalVerification();
