require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deletePlaceholderPrompts() {
  console.log('🗑️  Deleting placeholder recall prompts...\n');

  // Get count first
  const { data: placeholders, error: countError } = await supabase
    .from('recall_prompts')
    .select('id')
    .or('prompt.ilike.%concept 1%,prompt.ilike.%concept 2%,prompt.ilike.%concept 3%,prompt.ilike.%concept 4%,prompt.ilike.%key concepts of%part%');

  if (countError) {
    console.error('Error counting placeholders:', countError);
    return;
  }

  console.log(`Found ${placeholders?.length || 0} placeholder recall prompts to delete\n`);

  if (!placeholders || placeholders.length === 0) {
    console.log('✅ No placeholders found!');
    return;
  }

  // Delete them
  const { error: deleteError } = await supabase
    .from('recall_prompts')
    .delete()
    .or('prompt.ilike.%concept 1%,prompt.ilike.%concept 2%,prompt.ilike.%concept 3%,prompt.ilike.%concept 4%,prompt.ilike.%key concepts of%part%');

  if (deleteError) {
    console.error('❌ Error deleting:', deleteError);
    return;
  }

  console.log(`✅ Deleted ${placeholders.length} placeholder recall prompts`);
  console.log('\n📝 Note: These subtopics will now show "Recall prompts not yet available"');
  console.log('   until proper content is generated.');
}

deletePlaceholderPrompts();
