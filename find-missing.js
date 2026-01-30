require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findMissing() {
  const { data: allSubtopics } = await supabase
    .from('subtopics')
    .select('id, name, topics(name, subjects(name))');

  console.log('🔍 Finding subtopics with missing content...\n');

  let missingQuestions = [];
  let missingRecall = [];

  for (const subtopic of allSubtopics) {
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

    if (!questions || questions.length === 0) {
      missingQuestions.push(`${subtopic.topics.subjects.name} > ${subtopic.topics.name} > ${subtopic.name} (ID: ${subtopic.id})`);
    }

    if (!recall || recall.length === 0) {
      missingRecall.push(`${subtopic.topics.subjects.name} > ${subtopic.topics.name} > ${subtopic.name} (ID: ${subtopic.id})`);
    }
  }

  if (missingQuestions.length > 0) {
    console.log(`❌ Missing practice questions (${missingQuestions.length}):`);
    missingQuestions.forEach(m => console.log(`   ${m}`));
    console.log('');
  }

  if (missingRecall.length > 0) {
    console.log(`❌ Missing recall prompts (${missingRecall.length}):`);
    missingRecall.forEach(m => console.log(`   ${m}`));
    console.log('');
  }

  if (missingQuestions.length === 0 && missingRecall.length === 0) {
    console.log('✨ All content complete!');
  }
}

findMissing().catch(console.error);
