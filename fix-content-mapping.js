const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMapping() {
  console.log('🔧 FIXING CONTENT MAPPING\n');

  // Get all flashcard_sets
  const { data: sets } = await supabase
    .from('flashcard_sets')
    .select('*');

  console.log(`Found ${sets.length} flashcard_sets to process\n`);

  let fixed = 0;
  let notFound = 0;

  for (const set of sets) {
    // Get current subtopic
    const { data: oldSubtopic } = await supabase
      .from('subtopics')
      .select('name, topic_id')
      .eq('id', set.subtopic_id)
      .maybeSingle();

    if (!oldSubtopic) {
      console.log(`❌ Subtopic not found for set: ${set.name}`);
      notFound++;
      continue;
    }

    // Get topic and subject
    const { data: topic } = await supabase
      .from('topics')
      .select('name, subject_id')
      .eq('id', oldSubtopic.topic_id)
      .single();

    const { data: subject } = await supabase
      .from('subjects')
      .select('slug')
      .eq('id', topic.subject_id)
      .single();

    // Find matching subtopic in current structure by name AND subject
    const { data: allTopics } = await supabase
      .from('topics')
      .select('id')
      .eq('subject_id', topic.subject_id);

    const topicIds = allTopics.map(t => t.id);

    const { data: newSubtopic } = await supabase
      .from('subtopics')
      .select('id')
      .eq('name', oldSubtopic.name)
      .in('topic_id', topicIds)
      .neq('id', set.subtopic_id) // Different from current
      .maybeSingle();

    if (newSubtopic) {
      // Update flashcard_set to point to new subtopic
      await supabase
        .from('flashcard_sets')
        .update({ subtopic_id: newSubtopic.id })
        .eq('id', set.id);

      // Update all flashcards
      await supabase
        .from('flashcards')
        .update({ subtopic_id: newSubtopic.id })
        .eq('flashcard_set_id', set.id);

      console.log(`✓ Fixed: ${subject.slug} - ${oldSubtopic.name}`);
      fixed++;
    }
  }

  // Same for quizzes
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*');

  for (const quiz of quizzes) {
    const { data: oldSubtopic } = await supabase
      .from('subtopics')
      .select('name, topic_id')
      .eq('id', quiz.subtopic_id)
      .maybeSingle();

    if (!oldSubtopic) continue;

    const { data: topic } = await supabase
      .from('topics')
      .select('subject_id')
      .eq('id', oldSubtopic.topic_id)
      .single();

    const { data: allTopics } = await supabase
      .from('topics')
      .select('id')
      .eq('subject_id', topic.subject_id);

    const topicIds = allTopics.map(t => t.id);

    const { data: newSubtopic } = await supabase
      .from('subtopics')
      .select('id')
      .eq('name', oldSubtopic.name)
      .in('topic_id', topicIds)
      .neq('id', quiz.subtopic_id)
      .maybeSingle();

    if (newSubtopic) {
      await supabase
        .from('quizzes')
        .update({ subtopic_id: newSubtopic.id })
        .eq('id', quiz.id);

      await supabase
        .from('quiz_questions')
        .update({ subtopic_id: newSubtopic.id })
        .eq('quiz_id', quiz.id);

      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed} content items`);
  console.log(`❌ Not found: ${notFound}`);
}

fixMapping().catch(console.error);
