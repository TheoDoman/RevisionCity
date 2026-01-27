#!/usr/bin/env node

/**
 * Generate Subject Content - Automated IGCSE Content Generator
 *
 * Usage:
 *   node scripts/generate-subject-content.js chemistry
 *   node scripts/generate-subject-content.js chemistry --sql-only
 *
 * Features:
 * - Queries database for existing topic/subtopic structure
 * - Generates comprehensive IGCSE content using Claude
 * - Creates SQL import file ready for Supabase
 * - Optionally imports directly to database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });

// Initialize clients
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: Generate content with Claude
async function generateWithAI(prompt, maxTokens = 4000) {
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// Helper: Extract JSON from AI response
function extractJSON(text) {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) return jsonMatch[1].trim();
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const start = firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);
  if (start === -1) return text;
  return text.slice(start);
}

// Helper: Escape SQL strings
function escapeSQLString(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

// Helper: Convert array to PostgreSQL array
function toSQLArray(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::text[]';
  return `ARRAY[${arr.map(escapeSQLString).join(', ')}]::text[]`;
}

// Helper: Convert JSON to PostgreSQL JSONB
function toSQLJSON(obj) {
  return escapeSQLString(JSON.stringify(obj));
}

// Generate comprehensive notes
async function generateNotes(subject, topic, subtopic) {
  const prompt = `You are an expert Cambridge IGCSE ${subject} teacher. Create comprehensive revision notes for "${subtopic}" in the topic "${topic}".

The notes should be detailed, exam-focused, and include:
- Clear explanations of all key concepts
- Real-world examples and applications
- Common exam questions and how to approach them
- Tips for remembering key information
- Common mistakes students make

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "${subtopic}",
  "content": "Use markdown with ## headings, ### subheadings, **bold** for key terms, bullet points where appropriate. Write at least 800-1000 words covering the topic comprehensively for IGCSE level.",
  "key_points": ["5-8 key points that summarize the most important things to remember"]
}`;

  const text = await generateWithAI(prompt, 4096);
  return JSON.parse(extractJSON(text));
}

// Generate 8 flashcards (easy to hard progression)
async function generateFlashcards(subject, topic, subtopic) {
  const prompt = `You are an expert Cambridge IGCSE ${subject} teacher. Create exactly 8 flashcards for "${subtopic}" in "${topic}".

Progressive difficulty: 3 easy, 3 medium, 2 hard

Include a mix of:
- Definition cards (what is X?)
- Explanation cards (why does X happen?)
- Application cards (how would you use X?)
- Comparison cards (difference between X and Y?)

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {"front": "question or term", "back": "detailed answer or definition", "difficulty": "easy|medium|hard"}
]

Create exactly 8 flashcards.`;

  const text = await generateWithAI(prompt, 3000);
  return JSON.parse(extractJSON(text));
}

// Generate 10 quiz questions
async function generateQuiz(subject, topic, subtopic) {
  const prompt = `You are an expert Cambridge IGCSE ${subject} teacher. Create exactly 10 quiz questions for "${subtopic}" in "${topic}".

Mix of question types:
- 7 multiple choice (4 options each)
- 3 true/false

Questions should test understanding, not just recall. Include plausible wrong answers.

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "question": "question text",
    "question_type": "multiple_choice",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "explanation": "detailed explanation of why this is correct and why other options are wrong",
    "difficulty": "easy|medium|hard"
  }
]

Create exactly 10 questions (3 easy, 5 medium, 2 hard).`;

  const text = await generateWithAI(prompt, 3500);
  return JSON.parse(extractJSON(text));
}

// Generate 5 practice questions with mark schemes
async function generatePractice(subject, topic, subtopic) {
  const prompt = `You are an expert Cambridge IGCSE ${subject} examiner. Create exactly 5 exam-style practice questions for "${subtopic}" in "${topic}".

Include a variety:
- 2 short answer questions (2-3 marks)
- 2 medium questions (4-6 marks)
- 1 extended response question (8-10 marks)

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "question": "Full exam-style question with context if needed",
    "marks": 4,
    "mark_scheme": ["Point 1 (1 mark)", "Point 2 (1 mark)", "Point 3 (1 mark)", "Point 4 (1 mark)"],
    "example_answer": "A full model answer that would achieve all marks",
    "difficulty": "foundation|higher|extended"
  }
]

Create exactly 5 questions.`;

  const text = await generateWithAI(prompt, 3500);
  return JSON.parse(extractJSON(text));
}

// Generate 4 active recall prompts
async function generateRecall(subject, topic, subtopic) {
  const prompt = `You are an expert Cambridge IGCSE ${subject} teacher. Create exactly 4 active recall prompts for "${subtopic}" in "${topic}".

These should encourage deep thinking and explanation, not just recall.

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "prompt": "Open-ended question requiring explanation",
    "hints": ["hint 1", "hint 2", "hint 3"],
    "model_answer": "Comprehensive answer (100-150 words)",
    "key_points_to_include": ["point 1", "point 2", "point 3", "point 4"]
  }
]

Create exactly 4 prompts.`;

  const text = await generateWithAI(prompt, 3000);
  return JSON.parse(extractJSON(text));
}

// Generate content for one subtopic
async function generateSubtopicContent(subject, topic, subtopic) {
  console.log(`    📝 ${subtopic.name}`);

  const content = {
    subtopic,
    notes: null,
    flashcards: [],
    quizQuestions: [],
    practiceQuestions: [],
    recallPrompts: []
  };

  try {
    console.log('       - Notes...');
    content.notes = await generateNotes(subject.name, topic.name, subtopic.name);
    await new Promise(r => setTimeout(r, 500));

    console.log('       - Flashcards...');
    content.flashcards = await generateFlashcards(subject.name, topic.name, subtopic.name);
    await new Promise(r => setTimeout(r, 500));

    console.log('       - Quiz questions...');
    content.quizQuestions = await generateQuiz(subject.name, topic.name, subtopic.name);
    await new Promise(r => setTimeout(r, 500));

    console.log('       - Practice questions...');
    content.practiceQuestions = await generatePractice(subject.name, topic.name, subtopic.name);
    await new Promise(r => setTimeout(r, 500));

    console.log('       - Recall prompts...');
    content.recallPrompts = await generateRecall(subject.name, topic.name, subtopic.name);
    await new Promise(r => setTimeout(r, 500));

    console.log('       ✅ Complete');
    return content;
  } catch (error) {
    console.error(`       ❌ Error: ${error.message}`);
    return null;
  }
}

// Generate SQL file
function generateSQLFile(subjectName, topicContents) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${subjectName.toLowerCase().replace(/\s+/g, '-')}-import-${timestamp}.sql`;
  const filepath = path.join(__dirname, '..', 'generated-sql', filename);

  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let sql = `-- Generated content for ${subjectName}\n`;
  sql += `-- Generated at: ${new Date().toISOString()}\n`;
  sql += `-- This file can be run in Supabase SQL Editor\n\n`;

  for (const topicContent of topicContents) {
    const { topic, subtopicContents } = topicContent;

    sql += `\n-- ============================================\n`;
    sql += `-- Topic: ${topic.name}\n`;
    sql += `-- ============================================\n\n`;

    for (const content of subtopicContents) {
      if (!content) continue;

      const { subtopic, notes, flashcards, quizQuestions, practiceQuestions, recallPrompts } = content;

      sql += `\n-- Subtopic: ${subtopic.name}\n`;

      // Notes
      if (notes) {
        sql += `\n-- Notes\n`;
        sql += `INSERT INTO notes (subtopic_id, title, content, key_points)\n`;
        sql += `SELECT id, ${escapeSQLString(notes.title)}, ${escapeSQLString(notes.content)}, ${toSQLArray(notes.key_points)}\n`;
        sql += `FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)})\n`;
        sql += `ON CONFLICT (subtopic_id) DO UPDATE SET\n`;
        sql += `  title = EXCLUDED.title,\n`;
        sql += `  content = EXCLUDED.content,\n`;
        sql += `  key_points = EXCLUDED.key_points;\n\n`;
      }

      // Flashcards
      if (flashcards && flashcards.length > 0) {
        sql += `\n-- Flashcards (delete existing first)\n`;
        sql += `DELETE FROM flashcards WHERE subtopic_id = (SELECT id FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)}));\n\n`;

        for (const fc of flashcards) {
          sql += `INSERT INTO flashcards (subtopic_id, front, back, difficulty)\n`;
          sql += `SELECT id, ${escapeSQLString(fc.front)}, ${escapeSQLString(fc.back)}, ${escapeSQLString(fc.difficulty)}\n`;
          sql += `FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)});\n\n`;
        }
      }

      // Quiz questions
      if (quizQuestions && quizQuestions.length > 0) {
        sql += `\n-- Quiz questions (delete existing first)\n`;
        sql += `DELETE FROM quiz_questions WHERE subtopic_id = (SELECT id FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)}));\n\n`;

        for (const q of quizQuestions) {
          sql += `INSERT INTO quiz_questions (subtopic_id, question, question_type, options, correct_answer, explanation, difficulty)\n`;
          sql += `SELECT id, ${escapeSQLString(q.question)}, ${escapeSQLString(q.question_type)}, ${escapeSQLString(JSON.stringify(q.options))}, ${escapeSQLString(q.correct_answer)}, ${escapeSQLString(q.explanation)}, ${escapeSQLString(q.difficulty)}\n`;
          sql += `FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)});\n\n`;
        }
      }

      // Practice questions
      if (practiceQuestions && practiceQuestions.length > 0) {
        sql += `\n-- Practice questions (delete existing first)\n`;
        sql += `DELETE FROM practice_questions WHERE subtopic_id = (SELECT id FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)}));\n\n`;

        for (const p of practiceQuestions) {
          sql += `INSERT INTO practice_questions (subtopic_id, question, marks, mark_scheme, example_answer, difficulty)\n`;
          sql += `SELECT id, ${escapeSQLString(p.question)}, ${p.marks}, ${toSQLArray(p.mark_scheme)}, ${escapeSQLString(p.example_answer)}, ${escapeSQLString(p.difficulty)}\n`;
          sql += `FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)});\n\n`;
        }
      }

      // Recall prompts
      if (recallPrompts && recallPrompts.length > 0) {
        sql += `\n-- Recall prompts (delete existing first)\n`;
        sql += `DELETE FROM recall_prompts WHERE subtopic_id = (SELECT id FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)}));\n\n`;

        for (const r of recallPrompts) {
          sql += `INSERT INTO recall_prompts (subtopic_id, prompt, hints, model_answer, key_points_to_include)\n`;
          sql += `SELECT id, ${escapeSQLString(r.prompt)}, ${toSQLArray(r.hints)}, ${escapeSQLString(r.model_answer)}, ${toSQLArray(r.key_points_to_include)}\n`;
          sql += `FROM subtopics WHERE slug = ${escapeSQLString(subtopic.slug)} AND topic_id = (SELECT id FROM topics WHERE slug = ${escapeSQLString(topic.slug)});\n\n`;
        }
      }
    }
  }

  fs.writeFileSync(filepath, sql);
  return filepath;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const subjectSlug = args[0]?.toLowerCase();
  const sqlOnly = args.includes('--sql-only');

  if (!subjectSlug) {
    console.log('Usage: node scripts/generate-subject-content.js <subject> [--sql-only]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/generate-subject-content.js chemistry');
    console.log('  node scripts/generate-subject-content.js chemistry --sql-only');
    console.log('');
    console.log('Options:');
    console.log('  --sql-only    Generate SQL file only (no direct import)');
    return;
  }

  console.log('🚀 IGCSE Content Generator\n');
  console.log(`Subject: ${subjectSlug}`);
  console.log(`Mode: ${sqlOnly ? 'SQL file only' : 'Generate and optionally import'}\n`);

  // Get subject
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', subjectSlug)
    .single();

  if (subjectError || !subject) {
    console.error(`❌ Subject "${subjectSlug}" not found in database`);
    return;
  }

  console.log(`📚 ${subject.name}\n`);

  // Get topics
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subject.id)
    .order('order_index');

  if (topicsError || !topics || topics.length === 0) {
    console.error(`❌ No topics found for ${subject.name}`);
    return;
  }

  console.log(`Found ${topics.length} topics\n`);

  const allTopicContents = [];

  for (const topic of topics) {
    console.log(`📖 ${topic.name}`);

    // Get subtopics
    const { data: subtopics } = await supabase
      .from('subtopics')
      .select('*')
      .eq('topic_id', topic.id)
      .order('order_index');

    if (!subtopics || subtopics.length === 0) {
      console.log('   ⚠️  No subtopics found, skipping...\n');
      continue;
    }

    console.log(`   Found ${subtopics.length} subtopics\n`);

    const subtopicContents = [];

    for (const subtopic of subtopics) {
      const content = await generateSubtopicContent(subject, topic, subtopic);
      subtopicContents.push(content);

      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }

    allTopicContents.push({
      topic,
      subtopicContents
    });

    console.log('');
  }

  // Generate SQL file
  console.log('📄 Generating SQL file...');
  const sqlFile = generateSQLFile(subject.name, allTopicContents);
  console.log(`✅ SQL file created: ${sqlFile}\n`);

  console.log('🎉 Content generation complete!\n');
  console.log('Next steps:');
  console.log('1. Review the SQL file');
  console.log('2. Run: node scripts/import-to-supabase.js ' + path.basename(sqlFile));
  console.log('   OR manually copy/paste into Supabase SQL Editor\n');
}

main().catch(console.error);
