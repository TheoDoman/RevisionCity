require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getPlaceholderDetails() {
  console.log('🔍 Getting details on placeholder recall prompts...\n');

  // Get all recall prompts with "concept" pattern
  const { data: recallPrompts } = await supabase
    .from('recall_prompts')
    .select(`
      id,
      prompt,
      subtopics!inner(id, name, topics!inner(name, subjects!inner(name)))
    `)
    .ilike('prompt', '%concept%');

  if (recallPrompts && recallPrompts.length > 0) {
    console.log(`Found ${recallPrompts.length} recall prompts with "concept" placeholder:\n`);

    const grouped = {};
    recallPrompts.forEach(rp => {
      const subject = rp.subtopics.topics.subjects.name;
      const topic = rp.subtopics.topics.name;
      const subtopic = rp.subtopics.name;
      const key = `${subject} → ${topic} → ${subtopic}`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(rp);
    });

    Object.keys(grouped).forEach(key => {
      console.log(`\n📍 ${key}`);
      grouped[key].forEach(rp => {
        console.log(`   - "${rp.prompt}"`);
      });
    });
  }

  console.log('\n\n🔍 Getting details on placeholder notes...\n');

  const { data: notes } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      content,
      subtopics!inner(id, name, topics!inner(name, subjects!inner(name)))
    `)
    .or('content.ilike.%concept%,content.ilike.%TODO%,content.ilike.%coming soon%');

  if (notes && notes.length > 0) {
    console.log(`Found ${notes.length} notes with placeholder patterns:\n`);

    notes.forEach(note => {
      const subject = note.subtopics.topics.subjects.name;
      const topic = note.subtopics.topics.name;
      const subtopic = note.subtopics.name;

      console.log(`\n📍 ${subject} → ${topic} → ${subtopic}`);
      console.log(`   Title: "${note.title}"`);
      console.log(`   Content preview: "${note.content?.substring(0, 100)}..."`);
    });
  }
}

getPlaceholderDetails();
