/**
 * Simple Seed Script
 * Inserts subject/topic/subtopic structure with placeholder content
 * Run with: npx tsx scripts/seed-simple.ts
 * 
 * Use this for testing - no API key needed!
 */

import { createClient } from '@supabase/supabase-js';
import { SUBJECTS_DATA, SubjectKey } from './seed-data';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🌱 Seeding database with structure...\n');
  
  const subjectKeys = Object.keys(SUBJECTS_DATA) as SubjectKey[];
  
  for (const subjectKey of subjectKeys) {
    const subjectData = SUBJECTS_DATA[subjectKey];
    console.log(`📚 ${subjectData.name}`);
    
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
      console.error('  ❌ Error:', subjectError?.message);
      continue;
    }
    
    for (let ti = 0; ti < subjectData.topics.length; ti++) {
      const topicData = subjectData.topics[ti];
      const topicSlug = topicData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
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
      
      console.log(`  📖 ${topicData.name} (${topicData.subtopics.length} subtopics)`);
      
      // Insert placeholder mind map
      await supabase.from('mind_maps').upsert({
        topic_id: topic.id,
        name: topicData.name,
        root_node: {
          id: 'root',
          label: topicData.name,
          children: topicData.subtopics.slice(0, 4).map((s, i) => ({
            id: `child-${i}`,
            label: s,
          })),
        },
      }, { onConflict: 'topic_id' });
      
      // Insert placeholder summary sheet
      await supabase.from('summary_sheets').upsert({
        topic_id: topic.id,
        title: `${topicData.name} Summary`,
        key_concepts: topicData.subtopics.slice(0, 5).map(s => `Understand ${s}`),
        definitions: [
          { term: 'Key Term 1', definition: 'Definition for this topic' },
          { term: 'Key Term 2', definition: 'Another important definition' },
        ],
        formulas: subjectKey === 'mathematics' || subjectKey === 'physics' || subjectKey === 'chemistry'
          ? [{ name: 'Key Formula', formula: 'A = B × C', usage: 'Used in calculations' }]
          : null,
        exam_tips: [
          'Read the question carefully',
          'Show your working',
          'Check your answers',
        ],
      }, { onConflict: 'topic_id' });
      
      // Insert subtopics with placeholder content
      for (let si = 0; si < topicData.subtopics.length; si++) {
        const subtopicName = topicData.subtopics[si];
        const subtopicSlug = subtopicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
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
        
        if (subtopicError || !subtopic) continue;
        
        // Insert placeholder notes
        await supabase.from('notes').upsert({
          subtopic_id: subtopic.id,
          title: subtopicName,
          content: `## ${subtopicName}\n\nThis section covers ${subtopicName.toLowerCase()} as part of ${topicData.name}.\n\n## Key Concepts\n\n- Important concept 1\n- Important concept 2\n- Important concept 3\n\n## Details\n\nContent will be generated here using AI to match the IGCSE syllabus.`,
          key_points: [
            `Understand the basics of ${subtopicName.toLowerCase()}`,
            'Learn key terminology',
            'Practice with examples',
            'Apply to exam questions',
          ],
        }, { onConflict: 'subtopic_id' });
        
        // Insert placeholder flashcards
        const flashcards = [
          { front: `What is ${subtopicName}?`, back: `${subtopicName} is a key concept in ${topicData.name}.`, difficulty: 'easy' },
          { front: `Why is ${subtopicName} important?`, back: 'It forms the foundation for understanding this topic.', difficulty: 'medium' },
          { front: `How do you apply ${subtopicName}?`, back: 'Apply through practice questions and real examples.', difficulty: 'hard' },
        ];
        for (const fc of flashcards) {
          await supabase.from('flashcards').insert({ subtopic_id: subtopic.id, ...fc });
        }
        
        // Insert placeholder quiz questions
        const quizQuestions = [
          {
            question: `Which best describes ${subtopicName}?`,
            question_type: 'multiple_choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: 'Option A',
            explanation: 'This is the correct definition.',
            difficulty: 'easy',
          },
          {
            question: `True or False: ${subtopicName} is part of ${topicData.name}.`,
            question_type: 'true_false',
            options: ['True', 'False'],
            correct_answer: 'True',
            explanation: 'Yes, this is correct.',
            difficulty: 'easy',
          },
        ];
        for (const q of quizQuestions) {
          await supabase.from('quiz_questions').insert({ subtopic_id: subtopic.id, ...q });
        }
        
        // Insert placeholder practice question
        await supabase.from('practice_questions').insert({
          subtopic_id: subtopic.id,
          question: `Explain the key concepts of ${subtopicName}. [4 marks]`,
          marks: 4,
          mark_scheme: ['Definition (1 mark)', 'Key feature 1 (1 mark)', 'Key feature 2 (1 mark)', 'Example (1 mark)'],
          example_answer: `${subtopicName} is an important concept. It involves... [full answer would go here]`,
          difficulty: 'foundation',
        });
        
        // Insert placeholder recall prompt
        await supabase.from('recall_prompts').insert({
          subtopic_id: subtopic.id,
          prompt: `Explain ${subtopicName} in your own words.`,
          hints: ['Think about the definition', 'Consider why it matters', 'Give an example'],
          model_answer: `${subtopicName} is... [detailed answer would go here]`,
          key_points_to_include: ['Definition', 'Key features', 'Examples'],
        });
      }
    }
  }
  
  console.log('\n✅ Database seeded successfully!');
  console.log('\nNext steps:');
  console.log('1. Run `npm run dev` to start the app');
  console.log('2. Run `npm run content:generate` to replace placeholder content with AI-generated content');
}

main().catch(console.error);
