require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateRecallPromptsForSubtopic(subtopic, subject, topic) {
  const prompt = `Generate 4-5 high-quality active recall prompts for IGCSE ${subject} students studying "${subtopic.name}" within the topic "${topic.name}".

Requirements:
- Each prompt should be a specific question about key concepts, NOT generic like "Explain concept 1"
- Prompts should test deep understanding, not just memorization
- Focus on exam-relevant content for Cambridge IGCSE
- Be specific to this subtopic, not generic
- Format as simple questions/prompts without numbering

Examples of GOOD prompts:
- "Explain how Newton's Third Law applies to rocket propulsion"
- "Describe the process of mitosis and its significance in growth"
- "Calculate the resultant force when multiple forces act on an object at different angles"

Examples of BAD prompts (do NOT generate these):
- "Explain Motion concept 1"
- "Explain the key concepts of Forces (part 1)"
- "Describe this topic"

Generate 4-5 specific, exam-focused recall prompts for "${subtopic.name}":`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = message.content[0].text;

    // Parse the prompts (split by newlines, filter empty)
    const prompts = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10 && !line.match(/^(Examples?|Requirements?|Note:)/i))
      .filter(line => !line.match(/^\d+[\.\)]/)) // Remove numbering if present
      .map(line => line.replace(/^[-•]\s*/, '')) // Remove bullet points
      .slice(0, 5); // Max 5 prompts

    return prompts;
  } catch (error) {
    console.error(`Error generating prompts for ${subtopic.name}:`, error.message);
    return [];
  }
}

async function regeneratePlaceholderPrompts() {
  console.log('🔄 Regenerating recall prompts with placeholder content...\n');

  // Get all subtopics with placeholder recall prompts
  const { data: placeholderPrompts } = await supabase
    .from('recall_prompts')
    .select(`
      id,
      subtopic_id,
      subtopics!inner(id, name, topics!inner(name, subjects!inner(name)))
    `)
    .ilike('prompt', '%concept%');

  if (!placeholderPrompts || placeholderPrompts.length === 0) {
    console.log('✅ No placeholder prompts found!');
    return;
  }

  // Group by subtopic
  const subtopicGroups = {};
  placeholderPrompts.forEach(rp => {
    if (!subtopicGroups[rp.subtopic_id]) {
      subtopicGroups[rp.subtopic_id] = {
        subtopic: rp.subtopics,
        subject: rp.subtopics.topics.subjects.name,
        topic: rp.subtopics.topics.name,
        promptIds: []
      };
    }
    subtopicGroups[rp.subtopic_id].promptIds.push(rp.id);
  });

  const subtopicIds = Object.keys(subtopicGroups);
  console.log(`Found ${subtopicIds.length} subtopics with placeholder recall prompts`);
  console.log(`Total placeholder prompts to replace: ${placeholderPrompts.length}\n`);

  let processed = 0;
  let failed = 0;

  for (const subtopicId of subtopicIds) {
    const { subtopic, subject, topic, promptIds } = subtopicGroups[subtopicId];

    console.log(`\n[${processed + 1}/${subtopicIds.length}] ${subject} → ${topic} → ${subtopic.name}`);
    console.log(`  Replacing ${promptIds.length} placeholder prompts...`);

    // Generate new prompts
    const newPrompts = await generateRecallPromptsForSubtopic(subtopic, subject, topic);

    if (newPrompts.length === 0) {
      console.log(`  ❌ Failed to generate new prompts`);
      failed++;
      continue;
    }

    // Delete old placeholder prompts
    const { error: deleteError } = await supabase
      .from('recall_prompts')
      .delete()
      .in('id', promptIds);

    if (deleteError) {
      console.error(`  ❌ Error deleting old prompts:`, deleteError);
      failed++;
      continue;
    }

    // Insert new prompts
    const promptsToInsert = newPrompts.map(prompt => ({
      subtopic_id: subtopicId,
      prompt: prompt,
      difficulty: 'medium'
    }));

    const { error: insertError } = await supabase
      .from('recall_prompts')
      .insert(promptsToInsert);

    if (insertError) {
      console.error(`  ❌ Error inserting new prompts:`, insertError);
      failed++;
      continue;
    }

    console.log(`  ✅ Replaced with ${newPrompts.length} high-quality prompts`);
    processed++;

    // Rate limiting - wait 1 second between API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n\n✅ Regeneration complete!`);
  console.log(`   Processed: ${processed}/${subtopicIds.length}`);
  console.log(`   Failed: ${failed}`);
}

regeneratePlaceholderPrompts();
