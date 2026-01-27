#!/usr/bin/env node

/**
 * Import SQL to Supabase - Direct SQL Execution
 *
 * This script imports SQL files directly to Supabase by executing them
 * statement by statement using the Supabase client.
 *
 * Usage:
 *   node scripts/import-sql-to-supabase.js generated-sql/chemistry-*.sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQLFile(filepath) {
  console.log(`\n📝 Reading: ${path.basename(filepath)}`);

  const sql = fs.readFileSync(filepath, 'utf-8');

  // Split into statements (basic - handles most cases)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s.length > 10);

  console.log(`   Found ${statements.length} SQL statements\n`);
  console.log('🚀 Executing...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    try {
      // Execute using raw SQL
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });

      if (error) {
        errors.push({ statement: i + 1, error: error.message, sql: stmt.substring(0, 100) });
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      errors.push({ statement: i + 1, error: err.message, sql: stmt.substring(0, 100) });
      errorCount++;
    }

    // Progress
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`   Progress: ${i + 1}/${statements.length} (${successCount} ✅, ${errorCount} ❌)\r`);
    }
  }

  console.log(`\n\n✅ Complete: ${successCount}/${statements.length} statements succeeded`);

  if (errorCount > 0) {
    console.log(`\n⚠️  ${errorCount} statements failed:\n`);
    errors.slice(0, 5).forEach(e => {
      console.log(`   Statement ${e.statement}:`);
      console.log(`   Error: ${e.error}`);
      console.log(`   SQL: ${e.sql}...`);
      console.log('');
    });

    if (errors.length > 5) {
      console.log(`   ... and ${errors.length - 5} more errors`);
    }

    console.log('\n💡 Note: Some errors may be expected (e.g., DELETE when no rows exist)');
  }

  return { successCount, errorCount };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/import-sql-to-supabase.js <sql-file>');
    console.log('');
    console.log('⚠️  IMPORTANT: This script requires a custom SQL function in Supabase.');
    console.log('   Run this in your Supabase SQL Editor first:\n');
    console.log('   CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$');
    console.log('   BEGIN EXECUTE sql; END;');
    console.log('   $$ LANGUAGE plpgsql SECURITY DEFINER;\n');
    console.log('Available SQL files:');
    const genDir = path.join(__dirname, '..', 'generated-sql');
    if (fs.existsSync(genDir)) {
      const files = fs.readdirSync(genDir).filter(f => f.endsWith('.sql'));
      files.forEach(f => console.log(`  - ${f}`));
    }
    return;
  }

  const filepath = args[0].startsWith('/')
    ? args[0]
    : path.join(__dirname, '..', args[0]);

  if (!fs.existsSync(filepath)) {
    console.error(`❌ File not found: ${filepath}`);
    return;
  }

  console.log('📦 Direct SQL Import to Supabase\n');

  await executeSQLFile(filepath);

  console.log('\n✅ Import complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify import: node scripts/validate-content.js');
  console.log('   2. Clear cache: rm -rf .next');
  console.log('   3. Restart dev: npm run dev\n');
}

main().catch(console.error);
