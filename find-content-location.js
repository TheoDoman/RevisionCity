const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findContent() {
  // Get all flashcard_sets and their topics
  const { data: sets } = await supabase
    .from('flashcard_sets')
    .select('subtopic_id, name');

  const topicCounts = {};

  for (const set of sets.slice(0, 20)) {
    const { data: subtopic } = await supabase.from('subtopics').select('topic_id').eq('id', set.subtopic_id).maybeSingle();
    if (!subtopic) continue;
    const { data: topic } = await supabase.from('topics').select('name, subject_id').eq('id', subtopic.topic_id).maybeSingle();
    if (!topic) continue;
    const { data: subject } = await supabase.from('subjects').select('name').eq('id', topic.subject_id).maybeSingle();

    const key = `${subject.name} - ${topic.name}`;
    topicCounts[key] = (topicCounts[key] || 0) + 1;
  }

  console.log('Flashcard sets by Subject - Topic (first 20):');
  Object.entries(topicCounts).sort((a,b) => b[1] - a[1]).forEach(([key, count]) => {
    console.log(`${count}x ${key}`);
  });
}

findContent().catch(console.error);
