/**
 * Content Generation Script
 * Generates all revision content using Claude Haiku API
 * Run with: npx tsx scripts/generate-content.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { SUBJECTS_DATA, SubjectKey } from './seed-data';

// Initialize clients
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to generate content with Claude Haiku
async function generateWithAI(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// Generate notes
async function generateNotes(subject: string, topic: string, subtopic: string) {
  const prompt = `You are an expert IGCSE ${subject} teacher. Create revision notes for "${subtopic}" in "${topic}".
Return ONLY valid JSON:
{
  "title": "${subtopic}",
  "content": "Markdown content with ## headings, **bold**, bullet points",
  "key_points": ["point1", "point2", "point3", "point4", "point5"]
}`;
  const text = await generateWithAI(prompt);
  return JSON.parse(text);
}

// Generate flashcards
async function generateFlashcards(subject: string, topic: string, subtopic: string) {
  const prompt = `Create 8 flashcards for IGCSE ${subject}, "${subtopic}" in "${topic}".
Return ONLY valid JSON array:
[{"front": "question", "back": "answer", "difficulty": "easy|medium|hard"}]`;
  const text = await generateWithAI(prompt);
  return JSON.parse(text);
}

// Generate quiz questions
async function generateQuiz(subject: string, topic: string, subtopic: string) {
  const prompt = `Create 6 quiz questions for IGCSE ${subject}, "${subtopic}" in "${topic}".
Mix multiple_choice and true_false types.
Return ONLY valid JSON array:
[{
  "question": "text",
  "question_type": "multiple_choice|true_false",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "A",
  "explanation": "why correct",
  "difficulty": "easy|medium|hard"
}]`;
  const text = await generateWithAI(prompt);
  return JSON.parse(text);
}

// Generate practice questions
async function generatePractice(subject: string, topic: string, subtopic: string) {
  const prompt = `Create 4 exam-style questions for IGCSE ${subject}, "${subtopic}" in "${topic}".
Return ONLY valid JSON array:
[{
  "question": "exam question",
  "marks": 4,
  "mark_scheme": ["point (1 mark)", "point (1 mark)"],
  "example_answer": "full answer",
  "difficulty": "foundation|higher|extended"
}]`;
  const text = await generateWithAI(prompt);
  return JSON.parse(text);
}

// Generate recall prompts
async function generateRecall(subject: string, topic: string, subtopic: string) {
  const prompt = `Create 4 active recall prompts for IGCSE ${subject}, "${subtopic}" in "${topic}".
Return ONLY valid JSON array:
[{
  "prompt": "Explain...",
  "hints": ["hint1", "hint2"],
  "model_answer": "detailed answer",
  "key_points_to_include": ["point1", "point2"]
}]`;
  const text = await generateWithAI(prompt);
  return JSON.parse(text);
}

// Generate mind map
async function generateMindMap(subject: string, topic: string, subtopics: string[]) {
  const prompt = `Create a mind map structure for IGCSE ${subject}, topic "${topic}" with subtopics: ${subtopics.join(', ')}.
Return ONLY valid JSON:
{
  "name": "${topic}",
  "root_node": {
    "id": "root",
    "label": "${topic}",
    "children": [{"id": "1", "label": "concept", "children": [{"id": "1a", "label": "detail"}]}]
  }
}`;
  const text = await generateWithAI(prompt);
  return JSON.parse(text);
}

// Generate summary sheet
async function generateSummary(subject: string, topic: string, subtopics: string[]) {
  const prompt = `Create a summary sheet for IGCSE ${subject}, topic "${topic}".
Return ONLY valid JSON:
{
  "title": "${topic} Summary",
  "key_concepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "definitions": [{"term": "Term", "definition": "Definition"}],
  "formulas": [{"name": "Formula Name", "formula": "A = B × C", "usage": "When to use"}],
  "exam_tips": ["tip1", "tip2", "tip3"]
}`;
  const text = await generateWithAI(prompt);
  return JSON.parse(text);
}

// Main function
async function main() {
  console.log('🚀 Starting content generation...\n');
  
  const subjectKeys = Object.keys(SUBJECTS_DATA) as SubjectKey[];
  
  for (const subjectKey of subjectKeys) {
    const subjectData = SUBJECTS_DATA[subjectKey];
    console.log(`\n📚 ${subjectData.name}`);
    
    // Insert subject
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .upsert({
        name: subjectData.name,
        slug: subjectKey,
        description: subjectData.description,
        icon: subjectData.icon,
        color: subjectData.color,
        topic_count: subjectData.topics.length,
      }, { onConflict: 'slug' })
      .select()
      .single();
    
    if (subjectError || !subject) {
      console.error('  ❌ Subject error:', subjectError?.message);
      continue;
    }
    
    for (let ti = 0; ti < subjectData.topics.length; ti++) {
      const topicData = subjectData.topics[ti];
      const topicSlug = topicData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log(`  📖 ${topicData.name}`);
      
      // Insert topic
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .upsert({
          subject_id: subject.id,
          name: topicData.name,
          slug: topicSlug,
          description: topicData.description,
          order_index: ti,
          subtopic_count: topicData.subtopics.length,
        }, { onConflict: 'subject_id,slug' })
        .select()
        .single();
      
      if (topicError || !topic) {
        console.error('    ❌ Topic error:', topicError?.message);
        continue;
      }
      
      // Generate mind map and summary for topic
      try {
        console.log('    🗺️  Mind map & summary...');
        const mindMap = await generateMindMap(subjectData.name, topicData.name, topicData.subtopics);
        await supabase.from('mind_maps').upsert({ topic_id: topic.id, ...mindMap }, { onConflict: 'topic_id' });
        
        const summary = await generateSummary(subjectData.name, topicData.name, topicData.subtopics);
        await supabase.from('summary_sheets').upsert({ topic_id: topic.id, ...summary }, { onConflict: 'topic_id' });
      } catch (e) {
        console.error('    ❌ Mind map/summary error');
      }
      
      // Process subtopics
      for (let si = 0; si < topicData.subtopics.length; si++) {
        const subtopicName = topicData.subtopics[si];
        const subtopicSlug = subtopicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        console.log(`    📝 ${subtopicName}`);
        
        // Insert subtopic
        const { data: subtopic, error: subtopicError } = await supabase
          .from('subtopics')
          .upsert({
            topic_id: topic.id,
            name: subtopicName,
            slug: subtopicSlug,
            description: `Learn about ${subtopicName.toLowerCase()}`,
            order_index: si,
          }, { onConflict: 'topic_id,slug' })
          .select()
          .single();
        
        if (subtopicError || !subtopic) {
          console.error('      ❌ Subtopic error:', subtopicError?.message);
          continue;
        }
        
        try {
          // Generate all content types
          console.log('       - Notes...');
          const notes = await generateNotes(subjectData.name, topicData.name, subtopicName);
          await supabase.from('notes').upsert({ subtopic_id: subtopic.id, ...notes }, { onConflict: 'subtopic_id' });
          
          console.log('       - Flashcards...');
          const flashcards = await generateFlashcards(subjectData.name, topicData.name, subtopicName);
          for (const fc of flashcards) {
            await supabase.from('flashcards').insert({ subtopic_id: subtopic.id, ...fc });
          }
          
          console.log('       - Quiz...');
          const quiz = await generateQuiz(subjectData.name, topicData.name, subtopicName);
          for (const q of quiz) {
            await supabase.from('quiz_questions').insert({ subtopic_id: subtopic.id, ...q });
          }
          
          console.log('       - Practice questions...');
          const practice = await generatePractice(subjectData.name, topicData.name, subtopicName);
          for (const p of practice) {
            await supabase.from('practice_questions').insert({ subtopic_id: subtopic.id, ...p });
          }
          
          console.log('       - Recall prompts...');
          const recall = await generateRecall(subjectData.name, topicData.name, subtopicName);
          for (const r of recall) {
            await supabase.from('recall_prompts').insert({ subtopic_id: subtopic.id, ...r });
          }
          
          console.log('       ✅ Done');
          
          // Rate limiting delay
          await new Promise(r => setTimeout(r, 300));
        } catch (e) {
          console.error('       ❌ Content generation error:', e);
        }
      }
    }
  }
  
  console.log('\n\n✅ Content generation complete!');
}

main().catch(console.error);
