const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateContent() {
  console.log('🚀 Generating content for ALL missing subtopics...\n');

  // Get all subjects
  const subjects = ['physics', 'chemistry', 'biology', 'mathematics', 'computer-science', 'business-studies', 'economics', 'geography', 'history'];

  let totalGenerated = 0;
  let sqlStatements = [];

  for (const slug of subjects) {
    console.log(`\n📚 Processing ${slug}...`);

    const { data: subject } = await supabase.from('subjects').select('id, name').eq('slug', slug).single();
    const { data: topics } = await supabase.from('topics').select('id, name').eq('subject_id', subject.id);

    for (const topic of topics) {
      const { data: subtopics } = await supabase.from('subtopics').select('id, name').eq('topic_id', topic.id);

      for (const subtopic of subtopics) {
        // Check if this subtopic already has content
        const { data: existingSet } = await supabase
          .from('flashcard_sets')
          .select('id')
          .eq('subtopic_id', subtopic.id)
          .maybeSingle();

        if (existingSet) {
          continue; // Skip if already has content
        }

        console.log(`  Generating: ${topic.name} > ${subtopic.name}`);

        // Generate with AI (using smaller model for speed)
        const prompt = `Generate IGCSE ${subject.name} revision content for: ${topic.name} - ${subtopic.name}

Return ONLY valid JSON (no markdown):
{
  "flashcards": [
    {"front": "Question", "back": "Answer", "difficulty": "medium"}
  ],
  "quiz_questions": [
    {"question": "Q", "type": "multiple_choice", "options": ["A","B","C","D"], "correct_answer": "A", "explanation": "Why", "difficulty": "medium"}
  ]
}

Generate 5 flashcards and 5 quiz questions.`;

        try {
          const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
          });

          const text = message.content[0].text;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) continue;

          const content = JSON.parse(jsonMatch[0]);

          // Generate SQL
          // Flashcard set
          sqlStatements.push(`
INSERT INTO flashcard_sets (subtopic_id, name)
VALUES ('${subtopic.id}', '${subtopic.name} - Flashcards')
ON CONFLICT (subtopic_id) DO UPDATE SET name = EXCLUDED.name;
`);

          // Flashcards
          for (const fc of content.flashcards || []) {
            const front = fc.front.replace(/'/g, "''");
            const back = fc.back.replace(/'/g, "''");
            sqlStatements.push(`
INSERT INTO flashcards (flashcard_set_id, subtopic_id, front, back, difficulty)
VALUES (
  (SELECT id FROM flashcard_sets WHERE subtopic_id = '${subtopic.id}'),
  '${subtopic.id}',
  '${front}',
  '${back}',
  '${fc.difficulty || 'medium'}'
);
`);
          }

          // Quiz
          sqlStatements.push(`
INSERT INTO quizzes (subtopic_id, name)
VALUES ('${subtopic.id}', '${subtopic.name} - Quiz')
ON CONFLICT (subtopic_id) DO UPDATE SET name = EXCLUDED.name;
`);

          // Quiz questions
          for (const qq of content.quiz_questions || []) {
            const question = qq.question.replace(/'/g, "''");
            const answer = qq.correct_answer.replace(/'/g, "''");
            const explanation = (qq.explanation || '').replace(/'/g, "''");
            const options = JSON.stringify(qq.options || []).replace(/'/g, "''");
            sqlStatements.push(`
INSERT INTO quiz_questions (quiz_id, subtopic_id, question, question_type, options, correct_answer, explanation, difficulty)
VALUES (
  (SELECT id FROM quizzes WHERE subtopic_id = '${subtopic.id}'),
  '${subtopic.id}',
  '${question}',
  '${qq.type || 'multiple_choice'}',
  '${options}'::jsonb,
  '${answer}',
  '${explanation}',
  '${qq.difficulty || 'medium'}'
);
`);
          }

          totalGenerated++;

        } catch (error) {
          console.log(`    ⚠️  Error: ${error.message}`);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  // Write SQL file
  const sql = sqlStatements.join('\n');
  fs.writeFileSync('generated-sql/all-missing-content.sql', sql);

  console.log(`\n✅ Generated content for ${totalGenerated} subtopics`);
  console.log(`📄 Saved to: generated-sql/all-missing-content.sql`);
}

generateContent().catch(console.error);
