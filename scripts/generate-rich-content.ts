/**
 * Enhanced Content Generation Script
 * Generates rich, detailed revision content using Claude Haiku
 * Run with: export $(cat .env.local | xargs) && npx tsx scripts/generate-rich-content.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to call Claude
async function generateWithAI(prompt: string, maxTokens: number = 4000): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// Extract JSON from response (handles markdown code blocks)
function extractJSON(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) return jsonMatch[1].trim();
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const start = firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);
  if (start === -1) return text;
  return text.slice(start);
}

// Generate detailed notes (1000+ words)
async function generateNotes(subject: string, topic: string, subtopic: string): Promise<any> {
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
  "content": "Use markdown with ## headings, ### subheadings, **bold** for key terms, bullet points where appropriate. Write at least 800-1000 words covering the topic comprehensively.",
  "key_points": ["5-8 key points that summarize the most important things to remember"]
}`;

  const text = await generateWithAI(prompt);
  return JSON.parse(extractJSON(text));
}

// Generate 15-20 flashcards
async function generateFlashcards(subject: string, topic: string, subtopic: string): Promise<any[]> {
  const prompt = `You are an expert Cambridge IGCSE ${subject} teacher. Create 18 flashcards for "${subtopic}" in "${topic}".

Include a mix of:
- Definition cards (what is X?)
- Explanation cards (why does X happen?)
- Application cards (how would you use X?)
- Comparison cards (difference between X and Y?)
- Example cards (give an example of X)

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {"front": "question or term", "back": "detailed answer or definition", "difficulty": "easy|medium|hard"}
]

Create exactly 18 flashcards with varied difficulty (6 easy, 8 medium, 4 hard).`;

  const text = await generateWithAI(prompt);
  return JSON.parse(extractJSON(text));
}

// Generate 12-15 quiz questions
async function generateQuiz(subject: string, topic: string, subtopic: string): Promise<any[]> {
  const prompt = `You are an expert Cambridge IGCSE ${subject} teacher. Create 14 quiz questions for "${subtopic}" in "${topic}".

Mix of question types:
- 10 multiple choice (4 options each)
- 4 true/false

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

Create 14 questions (5 easy, 6 medium, 3 hard).`;

  const text = await generateWithAI(prompt);
  return JSON.parse(extractJSON(text));
}

// Generate 6-8 practice questions with mark schemes
async function generatePractice(subject: string, topic: string, subtopic: string): Promise<any[]> {
  const prompt = `You are an expert Cambridge IGCSE ${subject} examiner. Create 7 exam-style practice questions for "${subtopic}" in "${topic}".

Include a variety:
- 2 short answer questions (2-3 marks)
- 3 medium questions (4-6 marks)  
- 2 extended response questions (8-10 marks)

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "question": "Full exam-style question with context if needed",
    "marks": 4,
    "mark_scheme": ["Point 1 (1 mark)", "Point 2 (1 mark)", "Point 3 (1 mark)", "Point 4 (1 mark)"],
    "example_answer": "A full model answer that would achieve all marks",
    "difficulty": "foundation|higher|extended"
  }
]`;

  const text = await generateWithAI(prompt);
  return JSON.parse(extractJSON(text));
}

// Generate 5-6 active recall prompts
async function generateRecall(subject: string, topic: string, subtopic: string): Promise<any[]> {
  const prompt = `You are an expert Cambridge IGCSE ${subject} teacher. Create 6 active recall prompts for "${subtopic}" in "${topic}".

These should encourage deep thinking and explanation, not just recall.

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "prompt": "Open-ended question requiring explanation",
    "hints": ["hint 1", "hint 2", "hint 3"],
    "model_answer": "Comprehensive answer (100-150 words)",
    "key_points_to_include": ["point 1", "point 2", "point 3", "point 4"]
  }
]`;

  const text = await generateWithAI(prompt);
  return JSON.parse(extractJSON(text));
}

// Generate detailed mind map
async function generateMindMap(subject: string, topic: string, subtopics: string[]): Promise<any> {
  const prompt = `Create a mind map structure for IGCSE ${subject}, topic "${topic}".
Subtopics to include: ${subtopics.join(', ')}

Return ONLY valid JSON (no markdown):
{
  "name": "${topic}",
  "root_node": {
    "id": "root",
    "label": "${topic}",
    "children": [
      {
        "id": "branch1",
        "label": "Main concept",
        "children": [
          {"id": "leaf1", "label": "Detail"},
          {"id": "leaf2", "label": "Detail"}
        ]
      }
    ]
  }
}

Create 4-6 main branches with 2-4 children each.`;

  const text = await generateWithAI(prompt);
  return JSON.parse(extractJSON(text));
}

// Generate comprehensive summary sheet
async function generateSummary(subject: string, topic: string, subtopics: string[]): Promise<any> {
  const prompt = `Create a one-page summary sheet for IGCSE ${subject}, topic "${topic}".
Subtopics: ${subtopics.join(', ')}

Return ONLY valid JSON (no markdown):
{
  "title": "${topic} - Summary Sheet",
  "key_concepts": ["8-10 most important concepts to remember"],
  "definitions": [
    {"term": "Key term 1", "definition": "Clear definition"},
    {"term": "Key term 2", "definition": "Clear definition"}
  ],
  "formulas": [
    {"name": "Formula name", "formula": "The formula", "usage": "When to use it"}
  ],
  "exam_tips": ["5-6 specific tips for answering exam questions on this topic"]
}

Include 8-10 key concepts, 6-8 definitions, formulas if relevant (null if not), and 5-6 exam tips.`;

  const text = await generateWithAI(prompt);
  return JSON.parse(extractJSON(text));
}

// Process a single subtopic
async function processSubtopic(
  subjectName: string,
  topicName: string,
  subtopicId: string,
  subtopicName: string
) {
  console.log(`       Generating content for: ${subtopicName}`);

  try {
    // Generate notes
    console.log('         - Notes...');
    const notes = await generateNotes(subjectName, topicName, subtopicName);
    await supabase.from('notes').upsert({
      subtopic_id: subtopicId,
      title: notes.title,
      content: notes.content,
      key_points: notes.key_points,
    }, { onConflict: 'subtopic_id' });

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));

    // Generate flashcards
    console.log('         - Flashcards...');
    const flashcards = await generateFlashcards(subjectName, topicName, subtopicName);
    // Delete existing flashcards first
    await supabase.from('flashcards').delete().eq('subtopic_id', subtopicId);
    for (const fc of flashcards) {
      await supabase.from('flashcards').insert({
        subtopic_id: subtopicId,
        front: fc.front,
        back: fc.back,
        difficulty: fc.difficulty,
      });
    }

    await new Promise(r => setTimeout(r, 500));

    // Generate quiz
    console.log('         - Quiz questions...');
    const quiz = await generateQuiz(subjectName, topicName, subtopicName);
    await supabase.from('quiz_questions').delete().eq('subtopic_id', subtopicId);
    for (const q of quiz) {
      await supabase.from('quiz_questions').insert({
        subtopic_id: subtopicId,
        question: q.question,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      });
    }

    await new Promise(r => setTimeout(r, 500));

    // Generate practice questions
    console.log('         - Practice questions...');
    const practice = await generatePractice(subjectName, topicName, subtopicName);
    await supabase.from('practice_questions').delete().eq('subtopic_id', subtopicId);
    for (const p of practice) {
      await supabase.from('practice_questions').insert({
        subtopic_id: subtopicId,
        question: p.question,
        marks: p.marks,
        mark_scheme: p.mark_scheme,
        example_answer: p.example_answer,
        difficulty: p.difficulty,
      });
    }

    await new Promise(r => setTimeout(r, 500));

    // Generate recall prompts
    console.log('         - Recall prompts...');
    const recall = await generateRecall(subjectName, topicName, subtopicName);
    await supabase.from('recall_prompts').delete().eq('subtopic_id', subtopicId);
    for (const r of recall) {
      await supabase.from('recall_prompts').insert({
        subtopic_id: subtopicId,
        prompt: r.prompt,
        hints: r.hints,
        model_answer: r.model_answer,
        key_points_to_include: r.key_points_to_include,
      });
    }

    console.log('         ✅ Done');
  } catch (error) {
    console.error(`         ❌ Error:`, error);
  }
}

// Main function - generate content for a specific subject
async function main() {
  const args = process.argv.slice(2);
  const targetSubject = args[0]?.toLowerCase();

  if (!targetSubject) {
    console.log('Usage: npx tsx scripts/generate-rich-content.ts <subject>');
    console.log('');
    console.log('Available subjects:');
    console.log('  mathematics, english, biology, chemistry, physics,');
    console.log('  french, spanish, business, economics, history, geography');
    console.log('');
    console.log('Or use "all" to generate for all subjects (takes a while!)');
    return;
  }

  console.log('🚀 Starting rich content generation...\n');

  // Get subjects from database
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('*')
    .order('name');

  if (subjectsError || !subjects) {
    console.error('Failed to fetch subjects:', subjectsError);
    return;
  }

  const subjectsToProcess = targetSubject === 'all' 
    ? subjects 
    : subjects.filter(s => s.slug === targetSubject);

  if (subjectsToProcess.length === 0) {
    console.error(`Subject "${targetSubject}" not found.`);
    return;
  }

  for (const subject of subjectsToProcess) {
    console.log(`\n📚 ${subject.name}`);

    // Get topics
    const { data: topics } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subject.id)
      .order('order_index');

    if (!topics) continue;

    for (const topic of topics) {
      console.log(`\n   📖 ${topic.name}`);

      // Get subtopics
      const { data: subtopics } = await supabase
        .from('subtopics')
        .select('*')
        .eq('topic_id', topic.id)
        .order('order_index');

      if (!subtopics || subtopics.length === 0) continue;

      // Generate mind map and summary for topic
      try {
        console.log('      🗺️  Generating mind map...');
        const mindMap = await generateMindMap(
          subject.name,
          topic.name,
          subtopics.map(s => s.name)
        );
        await supabase.from('mind_maps').upsert({
          topic_id: topic.id,
          name: mindMap.name,
          root_node: mindMap.root_node,
        }, { onConflict: 'topic_id' });

        await new Promise(r => setTimeout(r, 500));

        console.log('      📋 Generating summary sheet...');
        const summary = await generateSummary(
          subject.name,
          topic.name,
          subtopics.map(s => s.name)
        );
        await supabase.from('summary_sheets').upsert({
          topic_id: topic.id,
          title: summary.title,
          key_concepts: summary.key_concepts,
          definitions: summary.definitions,
          formulas: summary.formulas,
          exam_tips: summary.exam_tips,
        }, { onConflict: 'topic_id' });

      } catch (error) {
        console.error('      ❌ Error generating topic content:', error);
      }

      // Process each subtopic
      for (const subtopic of subtopics) {
        await processSubtopic(subject.name, topic.name, subtopic.id, subtopic.name);
        // Rate limiting delay between subtopics
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  console.log('\n\n✅ Content generation complete!');
}

main().catch(console.error);
