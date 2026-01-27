const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: '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'
});

async function importContent() {
  console.log('🚀 IMPORTING ALL CONTENT DIRECTLY TO DATABASE\n');

  const subjects = [
    { slug: 'physics', name: 'Physics' },
    { slug: 'chemistry', name: 'Chemistry' },
    { slug: 'biology', name: 'Biology' },
    { slug: 'mathematics', name: 'Mathematics' },
    { slug: 'computer-science', name: 'Computer Science' },
    { slug: 'business-studies', name: 'Business Studies' },
    { slug: 'economics', name: 'Economics' },
    { slug: 'geography', name: 'Geography' },
    { slug: 'history', name: 'History' },
  ];

  for (const subject of subjects) {
    console.log(`\n📚 Processing ${subject.name}...`);

    const { data: subjectData } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', subject.slug)
      .single();

    const { data: topics } = await supabase
      .from('topics')
      .select('id, name')
      .eq('subject_id', subjectData.id);

    for (const topic of topics) {
      const { data: subtopics } = await supabase
        .from('subtopics')
        .select('id, name')
        .eq('topic_id', topic.id);

      for (const subtopic of subtopics) {
        // Check if already has content
        const { data: existingSet } = await supabase
          .from('flashcard_sets')
          .select('id')
          .eq('subtopic_id', subtopic.id)
          .maybeSingle();

        if (existingSet) {
          // Check if it has flashcards
          const { count } = await supabase
            .from('flashcards')
            .select('*', { count: 'exact', head: true })
            .eq('flashcard_set_id', existingSet.id);

          if (count > 0) {
            console.log(`  ⏭️  Skipping ${subtopic.name} (already has ${count} flashcards)`);
            continue;
          }
        }

        console.log(`  📝 Generating: ${topic.name} > ${subtopic.name}`);

        // Generate content with AI
        const prompt = `Generate IGCSE ${subject.name} revision content for: ${topic.name} - ${subtopic.name}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "flashcards": [
    {"front": "Question here", "back": "Answer here", "difficulty": "easy"}
  ],
  "quiz_questions": [
    {"question": "Q", "type": "multiple_choice", "options": ["A","B","C","D"], "correct_answer": "A", "explanation": "Why", "difficulty": "medium"}
  ]
}

Generate 5-7 flashcards and 5 quiz questions. Keep answers concise and exam-focused.`;

        try {
          const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
          });

          const text = message.content[0].text;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.log(`    ⚠️  No JSON found in response`);
            continue;
          }

          const content = JSON.parse(jsonMatch[0]);

          // Create or get flashcard_set
          let flashcardSetId;
          if (existingSet) {
            flashcardSetId = existingSet.id;
          } else {
            const { data: newSet, error } = await supabase
              .from('flashcard_sets')
              .insert({ subtopic_id: subtopic.id, name: `${subtopic.name} - Flashcards` })
              .select()
              .single();

            if (error) {
              console.log(`    ❌ Error creating flashcard_set:`, error.message);
              continue;
            }
            flashcardSetId = newSet.id;
          }

          // Insert flashcards
          if (content.flashcards && content.flashcards.length > 0) {
            const flashcardsToInsert = content.flashcards.map(fc => ({
              flashcard_set_id: flashcardSetId,
              subtopic_id: subtopic.id,
              front: fc.front,
              back: fc.back,
              difficulty: fc.difficulty || 'medium'
            }));

            const { error: fcError } = await supabase
              .from('flashcards')
              .insert(flashcardsToInsert);

            if (fcError) {
              console.log(`    ⚠️  Flashcard error:`, fcError.message);
            } else {
              console.log(`    ✓ Added ${flashcardsToInsert.length} flashcards`);
            }
          }

          // Create or get quiz
          const { data: existingQuiz } = await supabase
            .from('quizzes')
            .select('id')
            .eq('subtopic_id', subtopic.id)
            .maybeSingle();

          let quizId;
          if (existingQuiz) {
            quizId = existingQuiz.id;
          } else {
            const { data: newQuiz, error } = await supabase
              .from('quizzes')
              .insert({ subtopic_id: subtopic.id, name: `${subtopic.name} - Quiz` })
              .select()
              .single();

            if (error) {
              console.log(`    ❌ Error creating quiz:`, error.message);
              continue;
            }
            quizId = newQuiz.id;
          }

          // Insert quiz questions
          if (content.quiz_questions && content.quiz_questions.length > 0) {
            const questionsToInsert = content.quiz_questions.map(qq => ({
              quiz_id: quizId,
              subtopic_id: subtopic.id,
              question: qq.question,
              question_type: qq.type || 'multiple_choice',
              options: qq.options || [],
              correct_answer: qq.correct_answer,
              explanation: qq.explanation || '',
              difficulty: qq.difficulty || 'medium'
            }));

            const { error: qqError } = await supabase
              .from('quiz_questions')
              .insert(questionsToInsert);

            if (qqError) {
              console.log(`    ⚠️  Quiz question error:`, qqError.message);
            } else {
              console.log(`    ✓ Added ${questionsToInsert.length} quiz questions`);
            }
          }

        } catch (error) {
          console.log(`    ❌ Error:`, error.message);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
  }

  console.log('\n✅ IMPORT COMPLETE!');
}

importContent().catch(console.error);
