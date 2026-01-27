#!/usr/bin/env node

/**
 * IMPORT TO DATABASE - Smart SQL Import with Conflict Resolution
 *
 * Imports generated SQL files to Supabase with conflict checking and validation
 *
 * Usage: node scripts/import-to-database.js <subject-slug> [sql-file]
 * Example: node scripts/import-to-database.js chemistry
 * Example: node scripts/import-to-database.js chemistry generated-sql/chemistry-full-2026-01-22.sql
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Utility functions
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

async function findLatestSQLFile(subjectSlug) {
  const sqlDir = path.join(process.cwd(), 'generated-sql');

  if (!fs.existsSync(sqlDir)) {
    throw new Error('generated-sql directory not found');
  }

  const files = fs.readdirSync(sqlDir)
    .filter(f => f.startsWith(subjectSlug) && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: path.join(sqlDir, f),
      mtime: fs.statSync(path.join(sqlDir, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    throw new Error(`No SQL files found for subject: ${subjectSlug}`);
  }

  return files[0];
}

async function checkDatabaseState(subjectSlug) {
  console.log('🔍 Checking current database state...\n');

  // Get subject
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', subjectSlug)
    .single();

  if (subjectError || !subject) {
    throw new Error(`Subject "${subjectSlug}" not found in database`);
  }

  // Get topics
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, name, slug, subtopic_count')
    .eq('subject_id', subject.id)
    .order('order_index');

  if (topicsError) {
    throw new Error(`Error fetching topics: ${topicsError.message}`);
  }

  // Get subtopics
  const { data: subtopics, error: subtopicsError } = await supabase
    .from('subtopics')
    .select(`
      id,
      name,
      slug,
      topic_id,
      topics!inner(slug)
    `)
    .eq('topics.subject_id', subject.id);

  if (subtopicsError) {
    throw new Error(`Error fetching subtopics: ${subtopicsError.message}`);
  }

  // Get content counts
  const subtopicIds = subtopics?.map(st => st.id) || [];

  let contentCounts = {
    notes: 0,
    flashcards: 0,
    quizQuestions: 0,
    practiceQuestions: 0,
    recallPrompts: 0
  };

  if (subtopicIds.length > 0) {
    const [notes, flashcards, quizQuestions, practiceQuestions, recallPrompts] = await Promise.all([
      supabase.from('notes').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds),
      supabase.from('flashcards').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds),
      supabase.from('quiz_questions').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds),
      supabase.from('practice_questions').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds),
      supabase.from('recall_prompts').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds)
    ]);

    contentCounts = {
      notes: notes.count || 0,
      flashcards: flashcards.count || 0,
      quizQuestions: quizQuestions.count || 0,
      practiceQuestions: practiceQuestions.count || 0,
      recallPrompts: recallPrompts.count || 0
    };
  }

  return {
    subject,
    topics: topics || [],
    subtopics: subtopics || [],
    contentCounts
  };
}

async function executeSQL(sqlContent) {
  console.log('📤 Executing SQL import...\n');

  try {
    // Execute the SQL using Supabase RPC or direct SQL
    // Note: Supabase JS client doesn't support raw SQL execution directly
    // We need to use the REST API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ query: sqlContent })
      }
    );

    if (!response.ok) {
      // If RPC method doesn't exist, we need to execute statements individually
      console.log('⚠️  Direct SQL execution not available, using statement-by-statement import...\n');
      return await executeStatementsIndividually(sqlContent);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    // Fallback to manual execution
    console.log('⚠️  Falling back to statement-by-statement import...\n');
    return await executeStatementsIndividually(sqlContent);
  }
}

async function executeStatementsIndividually(sqlContent) {
  // This is a workaround - in production you'd want to execute via Supabase SQL Editor
  // or use a database migration tool

  console.log('⚠️  IMPORTANT: Supabase JS client cannot execute raw SQL directly.\n');
  console.log('Please follow these steps to import:\n');
  console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/waqvyqpomedcejrkoikl');
  console.log('2. Navigate to: SQL Editor');
  console.log('3. Create a new query');
  console.log('4. Copy the SQL file content and paste it');
  console.log('5. Click "Run" to execute\n');

  return {
    success: false,
    manual: true,
    message: 'Manual import required via Supabase SQL Editor'
  };
}

async function verifyImport(subjectSlug, beforeState) {
  console.log('✅ Verifying import...\n');

  const afterState = await checkDatabaseState(subjectSlug);

  const changes = {
    topics: {
      before: beforeState.topics.length,
      after: afterState.topics.length,
      added: afterState.topics.length - beforeState.topics.length
    },
    subtopics: {
      before: beforeState.subtopics.length,
      after: afterState.subtopics.length,
      added: afterState.subtopics.length - beforeState.subtopics.length
    },
    notes: {
      before: beforeState.contentCounts.notes,
      after: afterState.contentCounts.notes,
      added: afterState.contentCounts.notes - beforeState.contentCounts.notes
    },
    flashcards: {
      before: beforeState.contentCounts.flashcards,
      after: afterState.contentCounts.flashcards,
      added: afterState.contentCounts.flashcards - beforeState.contentCounts.flashcards
    },
    quizQuestions: {
      before: beforeState.contentCounts.quizQuestions,
      after: afterState.contentCounts.quizQuestions,
      added: afterState.contentCounts.quizQuestions - beforeState.contentCounts.quizQuestions
    },
    practiceQuestions: {
      before: beforeState.contentCounts.practiceQuestions,
      after: afterState.contentCounts.practiceQuestions,
      added: afterState.contentCounts.practiceQuestions - beforeState.contentCounts.practiceQuestions
    },
    recallPrompts: {
      before: beforeState.contentCounts.recallPrompts,
      after: afterState.contentCounts.recallPrompts,
      added: afterState.contentCounts.recallPrompts - beforeState.contentCounts.recallPrompts
    }
  };

  return { afterState, changes };
}

async function updateSubtopicCounts(subjectId) {
  console.log('🔄 Updating subtopic counts...\n');

  // Get all topics for this subject
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, slug')
    .eq('subject_id', subjectId);

  if (topicsError) {
    throw new Error(`Error fetching topics: ${topicsError.message}`);
  }

  let updated = 0;

  for (const topic of topics) {
    // Count subtopics for this topic
    const { count, error: countError } = await supabase
      .from('subtopics')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topic.id);

    if (countError) {
      console.error(`   ❌ Error counting subtopics for topic ${topic.slug}:`, countError.message);
      continue;
    }

    // Update the count
    const { error: updateError } = await supabase
      .from('topics')
      .update({ subtopic_count: count || 0 })
      .eq('id', topic.id);

    if (updateError) {
      console.error(`   ❌ Error updating subtopic count for topic ${topic.slug}:`, updateError.message);
      continue;
    }

    console.log(`   ✅ Updated ${topic.slug}: ${count} subtopics`);
    updated++;
  }

  console.log(`\n✅ Updated ${updated}/${topics.length} topics\n`);
}

function printReport(beforeState, afterState, changes, sqlFile) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT REPORT');
  console.log('='.repeat(60) + '\n');

  console.log(`Subject: ${afterState.subject.name}`);
  console.log(`SQL File: ${path.basename(sqlFile)}`);
  console.log(`Import Time: ${new Date().toISOString()}\n`);

  console.log('CHANGES SUMMARY:');
  console.log('─'.repeat(60));
  console.log(`Topics:             ${changes.topics.before} → ${changes.topics.after} (+${changes.topics.added})`);
  console.log(`Subtopics:          ${changes.subtopics.before} → ${changes.subtopics.after} (+${changes.subtopics.added})`);
  console.log(`Notes:              ${changes.notes.before} → ${changes.notes.after} (+${changes.notes.added})`);
  console.log(`Flashcards:         ${changes.flashcards.before} → ${changes.flashcards.after} (+${changes.flashcards.added})`);
  console.log(`Quiz Questions:     ${changes.quizQuestions.before} → ${changes.quizQuestions.after} (+${changes.quizQuestions.added})`);
  console.log(`Practice Questions: ${changes.practiceQuestions.before} → ${changes.practiceQuestions.after} (+${changes.practiceQuestions.added})`);
  console.log(`Recall Prompts:     ${changes.recallPrompts.before} → ${changes.recallPrompts.after} (+${changes.recallPrompts.added})`);
  console.log('\n');

  console.log('CURRENT STATE:');
  console.log('─'.repeat(60));
  console.log(`Total Topics:       ${afterState.topics.length}`);
  console.log(`Total Subtopics:    ${afterState.subtopics.length}`);
  console.log(`Total Content:      ${
    afterState.contentCounts.notes +
    afterState.contentCounts.flashcards +
    afterState.contentCounts.quizQuestions +
    afterState.contentCounts.practiceQuestions +
    afterState.contentCounts.recallPrompts
  } items`);
  console.log('\n');

  console.log('TOPICS BREAKDOWN:');
  console.log('─'.repeat(60));
  afterState.topics.forEach((topic, i) => {
    const subtopicCount = afterState.subtopics.filter(
      st => st.topics.slug === topic.slug
    ).length;
    console.log(`${i + 1}. ${topic.name}`);
    console.log(`   Slug: ${topic.slug}`);
    console.log(`   Subtopics: ${subtopicCount}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORT COMPLETE');
  console.log('='.repeat(60) + '\n');
}

async function clearNextCache() {
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    console.log('🧹 Clearing Next.js cache...');
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Cache cleared\n');
  }
}

// Main execution
async function main() {
  const subjectSlug = process.argv[2];
  const sqlFilePath = process.argv[3];

  if (!subjectSlug) {
    console.error('❌ Error: Please provide a subject slug');
    console.error('Usage: node import-to-database.js <subject-slug> [sql-file]');
    console.error('Example: node import-to-database.js chemistry');
    console.error('Example: node import-to-database.js chemistry generated-sql/chemistry-full-2026-01-22.sql');
    process.exit(1);
  }

  console.log('\n🚀 IMPORT TO DATABASE - SQL Import System');
  console.log('==========================================\n');
  console.log(`Subject: ${subjectSlug}\n`);

  try {
    // 1. Find SQL file
    let sqlFile;
    if (sqlFilePath) {
      if (!fs.existsSync(sqlFilePath)) {
        throw new Error(`SQL file not found: ${sqlFilePath}`);
      }
      sqlFile = { name: path.basename(sqlFilePath), path: sqlFilePath };
      console.log(`📄 Using specified SQL file: ${sqlFile.name}\n`);
    } else {
      console.log('🔍 Finding latest SQL file...');
      sqlFile = await findLatestSQLFile(subjectSlug);
      console.log(`📄 Found: ${sqlFile.name}\n`);
    }

    // 2. Check current database state
    const beforeState = await checkDatabaseState(subjectSlug);

    console.log('CURRENT DATABASE STATE:');
    console.log('─'.repeat(60));
    console.log(`Topics:             ${beforeState.topics.length}`);
    console.log(`Subtopics:          ${beforeState.subtopics.length}`);
    console.log(`Notes:              ${beforeState.contentCounts.notes}`);
    console.log(`Flashcards:         ${beforeState.contentCounts.flashcards}`);
    console.log(`Quiz Questions:     ${beforeState.contentCounts.quizQuestions}`);
    console.log(`Practice Questions: ${beforeState.contentCounts.practiceQuestions}`);
    console.log(`Recall Prompts:     ${beforeState.contentCounts.recallPrompts}`);
    console.log('\n');

    // 3. Read SQL file
    console.log('📖 Reading SQL file...');
    const sqlContent = fs.readFileSync(sqlFile.path, 'utf8');
    const sqlSize = (sqlContent.length / 1024).toFixed(2);
    console.log(`✅ Read ${sqlSize} KB of SQL\n`);

    // 4. Execute SQL (with manual fallback)
    const result = await executeSQL(sqlContent);

    if (result.manual) {
      console.log('📋 MANUAL IMPORT INSTRUCTIONS');
      console.log('─'.repeat(60));
      console.log(`1. Open: ${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('//', '//supabase.com/dashboard/project/')}`);
      console.log(`2. Navigate to: SQL Editor`);
      console.log(`3. Open file: ${sqlFile.path}`);
      console.log(`4. Copy all content and paste in SQL Editor`);
      console.log(`5. Click "Run" to execute`);
      console.log(`6. After import, run: node scripts/import-to-database.js ${subjectSlug} --verify-only\n`);
      console.log(`SQL file location: ${sqlFile.path}\n`);
      return;
    }

    // 5. Update subtopic counts
    await updateSubtopicCounts(beforeState.subject.id);

    // 6. Verify import
    const { afterState, changes } = await verifyImport(subjectSlug, beforeState);

    // 7. Print report
    printReport(beforeState, afterState, changes, sqlFile.path);

    // 8. Clear Next.js cache
    await clearNextCache();

    console.log('NEXT STEPS:');
    console.log('─'.repeat(60));
    console.log(`1. Validate content: node scripts/validate-completeness.js ${subjectSlug}`);
    console.log(`2. Start dev server: npm run dev`);
    console.log(`3. Visit: http://localhost:3000/subjects/${subjectSlug}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Check for verify-only flag
if (process.argv.includes('--verify-only')) {
  (async () => {
    const subjectSlug = process.argv[2];
    console.log('\n🔍 VERIFY DATABASE STATE\n');
    const state = await checkDatabaseState(subjectSlug);
    console.log('CURRENT STATE:');
    console.log(`Topics:             ${state.topics.length}`);
    console.log(`Subtopics:          ${state.subtopics.length}`);
    console.log(`Notes:              ${state.contentCounts.notes}`);
    console.log(`Flashcards:         ${state.contentCounts.flashcards}`);
    console.log(`Quiz Questions:     ${state.contentCounts.quizQuestions}`);
    console.log(`Practice Questions: ${state.contentCounts.practiceQuestions}`);
    console.log(`Recall Prompts:     ${state.contentCounts.recallPrompts}\n`);
  })();
} else {
  main();
}
