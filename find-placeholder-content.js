require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const placeholderPatterns = [
  /concept \d+/i,
  /concept 1/i,
  /concept 2/i,
  /example \d+/i,
  /coming soon/i,
  /not yet available/i,
  /placeholder/i,
  /lorem ipsum/i,
  /\[insert.*\]/i,
  /TODO/i,
  /TBD/i,
];

function hasPlaceholder(text) {
  if (!text) return false;
  return placeholderPatterns.some(pattern => pattern.test(text));
}

async function findPlaceholders() {
  console.log('🔍 Searching for placeholder content in database...\n');

  const issues = [];

  // Check flashcards
  console.log('Checking flashcards...');
  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('id, front, back, flashcard_set_id');

  let flashcardIssues = 0;
  if (flashcards) {
    for (const card of flashcards) {
      if (hasPlaceholder(card.front) || hasPlaceholder(card.back)) {
        flashcardIssues++;
        if (flashcardIssues <= 5) {
          issues.push({
            type: 'flashcard',
            id: card.id,
            content: `Front: "${card.front?.substring(0, 50)}..." Back: "${card.back?.substring(0, 50)}..."`
          });
        }
      }
    }
  }
  console.log(`  Found ${flashcardIssues} flashcards with placeholders\n`);

  // Check practice questions
  console.log('Checking practice questions...');
  const { data: practiceQuestions } = await supabase
    .from('practice_questions')
    .select('id, question, answer');

  let practiceIssues = 0;
  if (practiceQuestions) {
    for (const q of practiceQuestions) {
      if (hasPlaceholder(q.question) || hasPlaceholder(q.answer)) {
        practiceIssues++;
        if (practiceIssues <= 5) {
          issues.push({
            type: 'practice_question',
            id: q.id,
            content: `Q: "${q.question?.substring(0, 80)}..."`
          });
        }
      }
    }
  }
  console.log(`  Found ${practiceIssues} practice questions with placeholders\n`);

  // Check notes
  console.log('Checking notes...');
  const { data: notes } = await supabase
    .from('notes')
    .select('id, title, content');

  let notesIssues = 0;
  if (notes) {
    for (const note of notes) {
      if (hasPlaceholder(note.title) || hasPlaceholder(note.content)) {
        notesIssues++;
        if (notesIssues <= 5) {
          issues.push({
            type: 'note',
            id: note.id,
            content: `Title: "${note.title}" Content: "${note.content?.substring(0, 80)}..."`
          });
        }
      }
    }
  }
  console.log(`  Found ${notesIssues} notes with placeholders\n`);

  // Check recall prompts
  console.log('Checking recall prompts...');
  const { data: recallPrompts } = await supabase
    .from('recall_prompts')
    .select('id, prompt');

  let recallIssues = 0;
  if (recallPrompts) {
    for (const prompt of recallPrompts) {
      if (hasPlaceholder(prompt.prompt)) {
        recallIssues++;
        if (recallIssues <= 5) {
          issues.push({
            type: 'recall_prompt',
            id: prompt.id,
            content: `"${prompt.prompt?.substring(0, 80)}..."`
          });
        }
      }
    }
  }
  console.log(`  Found ${recallIssues} recall prompts with placeholders\n`);

  console.log('\n📊 SUMMARY:');
  console.log(`❌ Flashcards: ${flashcardIssues}`);
  console.log(`❌ Practice Questions: ${practiceIssues}`);
  console.log(`❌ Notes: ${notesIssues}`);
  console.log(`❌ Recall Prompts: ${recallIssues}`);
  console.log(`\nTotal issues: ${flashcardIssues + practiceIssues + notesIssues + recallIssues}`);

  if (issues.length > 0) {
    console.log('\n\n🔍 Sample issues (first 5 of each type):');
    issues.forEach(issue => {
      console.log(`\n[${issue.type}] ID: ${issue.id}`);
      console.log(`  ${issue.content}`);
    });
  }
}

findPlaceholders();
