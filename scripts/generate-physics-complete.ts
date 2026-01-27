import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://waqvyqpomedcejrkoikl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcXZ5cXBvbWVkY2VqcmtvaWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEzNjYxOCwiZXhwIjoyMDgzNzEyNjE4fQ.YcshqsIfUdvHVbNj0g2hADIi-QQW0C5kUQ5UnuQgiW8';
const anthropicKey = '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';

const supabase = createClient(supabaseUrl, supabaseKey);
const anthropic = new Anthropic({ apiKey: anthropicKey });

interface Subtopic {
  id: string;
  name: string;
  topic_id: string;
}

async function fetchPhysicsSubtopics(): Promise<Subtopic[]> {
  // First get Physics subject ID
  const { data: subjects, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('name', 'Physics')
    .single();

  if (subjectError || !subjects) {
    throw new Error('Failed to fetch Physics subject: ' + subjectError?.message);
  }

  const physicsId = subjects.id;

  // Get all topics for Physics
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id')
    .eq('subject_id', physicsId);

  if (topicsError || !topics) {
    throw new Error('Failed to fetch Physics topics: ' + topicsError?.message);
  }

  const topicIds = topics.map(t => t.id);

  // Get all subtopics for these topics
  const { data: subtopics, error: subtopicsError } = await supabase
    .from('subtopics')
    .select('id, name, topic_id')
    .in('topic_id', topicIds)
    .order('name');

  if (subtopicsError || !subtopics) {
    throw new Error('Failed to fetch Physics subtopics: ' + subtopicsError?.message);
  }

  return subtopics;
}

async function generateNote(subtopicName: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Generate comprehensive IGCSE Physics revision notes for "${subtopicName}".

Requirements:
- 200-300 words
- Cover key concepts, definitions, and formulas
- Include important facts and relationships
- Write in clear, student-friendly language
- Use proper scientific terminology

Return ONLY the note content, no title or extra formatting.`
    }]
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}

async function generateFlashcards(subtopicName: string): Promise<Array<{front: string, back: string}>> {
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Generate 5-7 flashcards for IGCSE Physics topic "${subtopicName}".

Requirements:
- Each flashcard should have a clear question/term on front
- Concise, accurate answer on back
- Cover key concepts and definitions
- Mix of factual recall and understanding questions

Return ONLY a JSON array in this exact format:
[
  {"front": "question", "back": "answer"},
  {"front": "question", "back": "answer"}
]`
    }]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const text = content.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }
  return [];
}

async function generateQuiz(subtopicName: string): Promise<Array<{
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}>> {
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Generate 5 multiple-choice quiz questions for IGCSE Physics topic "${subtopicName}".

Requirements:
- Each question has 4 options
- One correct answer (index 0-3)
- Include brief explanation
- Mix of difficulty levels
- Test understanding, not just recall

Return ONLY a JSON array in this exact format:
[
  {
    "question": "question text",
    "options": ["A", "B", "C", "D"],
    "correct_answer": 0,
    "explanation": "why this is correct"
  }
]`
    }]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const text = content.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }
  return [];
}

async function generatePracticeQuestions(subtopicName: string): Promise<Array<{
  question: string;
  answer: string;
  difficulty: string;
  marks: number;
}>> {
  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Generate 10-15 practice questions for IGCSE Physics topic "${subtopicName}".

Requirements:
- Mix of easy (3-5 questions), medium (5-7 questions), hard (2-3 questions)
- Include mark allocations (1-6 marks)
- Detailed answers with working
- Cover different question types (calculation, explanation, description)

Return ONLY a JSON array in this exact format:
[
  {
    "question": "question text",
    "answer": "detailed answer with working",
    "difficulty": "easy|medium|hard",
    "marks": 2
  }
]`
    }]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const text = content.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }
  return [];
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  console.log('Fetching Physics subtopics...');
  const subtopics = await fetchPhysicsSubtopics();
  console.log(`Found ${subtopics.length} Physics subtopics`);

  let sqlOutput = `-- Physics Complete Content Generation
-- Generated: ${new Date().toISOString()}
-- Total Subtopics: ${subtopics.length}

`;

  for (let i = 0; i < subtopics.length; i++) {
    const subtopic = subtopics[i];
    console.log(`\n[${i + 1}/${subtopics.length}] Processing: ${subtopic.name}`);

    try {
      // Generate note
      console.log('  - Generating note...');
      const noteContent = await generateNote(subtopic.name);
      const noteId = generateUUID();

      sqlOutput += `-- Subtopic: ${subtopic.name}\n`;
      sqlOutput += `INSERT INTO notes (id, subtopic_id, content, created_at, updated_at)
VALUES ('${noteId}', '${subtopic.id}', '${escapeSQL(noteContent)}', NOW(), NOW())
ON CONFLICT (subtopic_id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();\n\n`;

      // Generate flashcards
      console.log('  - Generating flashcards...');
      const flashcards = await generateFlashcards(subtopic.name);
      if (flashcards.length > 0) {
        const flashcardSetId = generateUUID();
        sqlOutput += `INSERT INTO flashcard_sets (id, subtopic_id, title, created_at, updated_at)
VALUES ('${flashcardSetId}', '${subtopic.id}', '${escapeSQL(subtopic.name)} Flashcards', NOW(), NOW())
ON CONFLICT (subtopic_id) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()
RETURNING id;\n\n`;

        for (const card of flashcards) {
          const cardId = generateUUID();
          sqlOutput += `INSERT INTO flashcards (id, flashcard_set_id, front, back, created_at, updated_at)
VALUES ('${cardId}', (SELECT id FROM flashcard_sets WHERE subtopic_id = '${subtopic.id}'), '${escapeSQL(card.front)}', '${escapeSQL(card.back)}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;\n`;
        }
        sqlOutput += '\n';
      }

      // Generate quiz
      console.log('  - Generating quiz...');
      const quizQuestions = await generateQuiz(subtopic.name);
      if (quizQuestions.length > 0) {
        const quizId = generateUUID();
        sqlOutput += `INSERT INTO quizzes (id, subtopic_id, title, created_at, updated_at)
VALUES ('${quizId}', '${subtopic.id}', '${escapeSQL(subtopic.name)} Quiz', NOW(), NOW())
ON CONFLICT (subtopic_id) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()
RETURNING id;\n\n`;

        for (const q of quizQuestions) {
          const questionId = generateUUID();
          sqlOutput += `INSERT INTO quiz_questions (id, quiz_id, question, options, correct_answer, explanation, created_at, updated_at)
VALUES ('${questionId}', (SELECT id FROM quizzes WHERE subtopic_id = '${subtopic.id}'), '${escapeSQL(q.question)}', ARRAY[${q.options.map(o => `'${escapeSQL(o)}'`).join(', ')}], ${q.correct_answer}, '${escapeSQL(q.explanation)}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;\n`;
        }
        sqlOutput += '\n';
      }

      // Generate practice questions
      console.log('  - Generating practice questions...');
      const practiceQuestions = await generatePracticeQuestions(subtopic.name);
      for (const pq of practiceQuestions) {
        const pqId = generateUUID();
        sqlOutput += `INSERT INTO practice_questions (id, subtopic_id, question, answer, difficulty, marks, created_at, updated_at)
VALUES ('${pqId}', '${subtopic.id}', '${escapeSQL(pq.question)}', '${escapeSQL(pq.answer)}', '${pq.difficulty}', ${pq.marks}, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;\n`;
      }
      sqlOutput += '\n';

      console.log(`  ✓ Completed: ${subtopic.name}`);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`  ✗ Error processing ${subtopic.name}:`, error);
      sqlOutput += `-- ERROR generating content for ${subtopic.name}\n\n`;
    }
  }

  // Write to file
  const outputDir = path.join(process.cwd(), 'generated-sql');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'physics-complete-2026-01-25.sql');
  fs.writeFileSync(outputPath, sqlOutput);

  console.log(`\n✓ Complete! SQL written to: ${outputPath}`);
  console.log(`Total subtopics processed: ${subtopics.length}`);
}

main().catch(console.error);
