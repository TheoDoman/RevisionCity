const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function removeDuplicateFlashcards() {
  console.log('🔍 Finding duplicate flashcards...');

  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('id, front, back, subtopic_id, created_at')
    .order('created_at');

  const seen = new Map();
  const duplicateIds = [];

  for (const fc of flashcards || []) {
    const key = fc.front.toLowerCase().trim() + '|||' + fc.back.toLowerCase().trim() + '|||' + fc.subtopic_id;
    if (seen.has(key)) {
      // Keep the first one (older), delete this duplicate
      duplicateIds.push(fc.id);
    } else {
      seen.set(key, fc.id);
    }
  }

  console.log(`Found ${duplicateIds.length} duplicate flashcards`);

  if (duplicateIds.length > 0) {
    console.log('🗑️  Removing duplicates...');
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .in('id', duplicateIds);

    if (error) {
      console.error('Error removing flashcards:', error.message);
      return 0;
    }

    console.log(`✅ Removed ${duplicateIds.length} duplicate flashcards`);
    return duplicateIds.length;
  }

  return 0;
}

async function removeDuplicatePracticeQuestions() {
  console.log('\n🔍 Finding duplicate practice questions...');

  const { data: questions } = await supabase
    .from('practice_questions')
    .select('id, question, subtopic_id, created_at')
    .order('created_at');

  const seen = new Map();
  const duplicateIds = [];

  for (const q of questions || []) {
    const key = q.question.toLowerCase().trim() + '|||' + q.subtopic_id;
    if (seen.has(key)) {
      // Keep the first one (older), delete this duplicate
      duplicateIds.push(q.id);
    } else {
      seen.set(key, q.id);
    }
  }

  console.log(`Found ${duplicateIds.length} duplicate practice questions`);

  if (duplicateIds.length > 0) {
    console.log('🗑️  Removing duplicates...');
    const { error } = await supabase
      .from('practice_questions')
      .delete()
      .in('id', duplicateIds);

    if (error) {
      console.error('Error removing questions:', error.message);
      return 0;
    }

    console.log(`✅ Removed ${duplicateIds.length} duplicate practice questions`);
    return duplicateIds.length;
  }

  return 0;
}

async function removeDuplicateRecallPrompts() {
  console.log('\n🔍 Finding duplicate recall prompts...');

  const { data: prompts } = await supabase
    .from('recall_prompts')
    .select('id, prompt, subtopic_id, created_at')
    .order('created_at');

  const seen = new Map();
  const duplicateIds = [];

  for (const p of prompts || []) {
    const key = p.prompt.toLowerCase().trim() + '|||' + p.subtopic_id;
    if (seen.has(key)) {
      // Keep the first one (older), delete this duplicate
      duplicateIds.push(p.id);
    } else {
      seen.set(key, p.id);
    }
  }

  console.log(`Found ${duplicateIds.length} duplicate recall prompts`);

  if (duplicateIds.length > 0) {
    console.log('🗑️  Removing duplicates...');
    const { error } = await supabase
      .from('recall_prompts')
      .delete()
      .in('id', duplicateIds);

    if (error) {
      console.error('Error removing prompts:', error.message);
      return 0;
    }

    console.log(`✅ Removed ${duplicateIds.length} duplicate recall prompts`);
    return duplicateIds.length;
  }

  return 0;
}

async function main() {
  console.log('🚀 Starting duplicate removal...\n');

  const flashcardsRemoved = await removeDuplicateFlashcards();
  const questionsRemoved = await removeDuplicatePracticeQuestions();
  const promptsRemoved = await removeDuplicateRecallPrompts();

  console.log('\n' + '='.repeat(60));
  console.log('✨ DUPLICATE REMOVAL COMPLETE!');
  console.log('='.repeat(60));
  console.log(`🎴 Flashcards removed: ${flashcardsRemoved}`);
  console.log(`❓ Practice questions removed: ${questionsRemoved}`);
  console.log(`🧠 Recall prompts removed: ${promptsRemoved}`);
  console.log(`📊 Total removed: ${flashcardsRemoved + questionsRemoved + promptsRemoved}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
