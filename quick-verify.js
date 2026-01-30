require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickVerify() {
  console.log('🔍 Quick content verification...\n');

  // Get counts directly
  const { count: totalSubtopics } = await supabase
    .from('subtopics')
    .select('*', { count: 'exact', head: true });

  const { count: subtopicsWithFlashcards } = await supabase
    .from('subtopics')
    .select('id, flashcard_sets!inner(id)', { count: 'exact', head: true });

  const { count: subtopicsWithQuestions } = await supabase
    .from('subtopics')
    .select('id, practice_questions!inner(id)', { count: 'exact', head: true });

  const { count: subtopicsWithRecall } = await supabase
    .from('subtopics')
    .select('id, recall_prompts!inner(id)', { count: 'exact', head: true });

  console.log('📊 Final Results:');
  console.log(`   Total subtopics: ${totalSubtopics}`);
  console.log(`   ✅ With flashcards: ${subtopicsWithFlashcards}/${totalSubtopics}`);
  console.log(`   ✅ With practice questions: ${subtopicsWithQuestions}/${totalSubtopics}`);
  console.log(`   ✅ With recall prompts: ${subtopicsWithRecall}/${totalSubtopics}`);

  const allComplete = subtopicsWithFlashcards === totalSubtopics &&
                      subtopicsWithQuestions === totalSubtopics &&
                      subtopicsWithRecall === totalSubtopics;

  if (allComplete) {
    console.log('\n✨ ALL CONTENT COMPLETE! Ready to deploy! ✨\n');
  } else {
    console.log('\n⚠️  Some content still missing - check above\n');
  }
}

quickVerify().catch(console.error);
