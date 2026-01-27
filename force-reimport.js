const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function reimport(sqlFile, subjectName) {
  console.log(`\n📦 Force re-importing: ${subjectName}`);

  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Execute the SQL directly
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.log(`   Using alternative method...`);
    // If RPC doesn't work, manually execute via SQL editor
    // We'll need to copy/paste these
    console.log(`   ⚠️  Manual import needed: Copy ${sqlFile} to Supabase SQL Editor`);
    return false;
  }

  console.log(`   ✅ ${subjectName} imported`);
  return true;
}

async function main() {
  const files = [
    ['generated-sql/computer-science-full-2026-01-22-final.sql', 'Computer Science'],
    ['generated-sql/economics-full-2026-01-22-final.sql', 'Economics'],
    ['generated-sql/business-studies-full-2026-01-22-final.sql', 'Business Studies'],
    ['generated-sql/chemistry-full-2026-01-22-final.sql', 'Chemistry'],
    ['generated-sql/mathematics-full-2026-01-23-final.sql', 'Mathematics'],
  ];

  console.log('🔄 FORCE RE-IMPORT ALL SUBJECTS\n');
  console.log('This will use ON CONFLICT to update existing records...\n');

  for (const [file, name] of files) {
    await reimport(file, name);
  }

  console.log('\n✅ Done! Check database now.');
}

main();
