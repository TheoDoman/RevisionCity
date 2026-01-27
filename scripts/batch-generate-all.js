#!/usr/bin/env node

/**
 * Batch Generate All - Process Multiple Subjects
 *
 * Usage:
 *   node scripts/batch-generate-all.js
 *   node scripts/batch-generate-all.js --subjects chemistry,physics,biology
 *   node scripts/batch-generate-all.js --resume
 *
 * Features:
 * - Process all 7 remaining subjects automatically
 * - Generate and import all at once
 * - Progress reporting and time estimates
 * - Resume from failures
 * - Update subtopic counts after each subject
 */

const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Default subjects to generate (excluding already complete ones)
const DEFAULT_SUBJECTS = [
  'chemistry',
  'computer-science',
  'economics',
  'english-language',
  'english-literature',
  'geography',
  'business-studies'
];

// Progress tracking
const PROGRESS_FILE = path.join(__dirname, '.batch-progress.json');

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { completed: [], failed: [], startedAt: null };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function clearProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

// Run a command and return a promise
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n💻 Running: ${command} ${args.join(' ')}\n`);

    const proc = spawn(command, args, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

// Update subtopic counts for a subject
async function updateSubtopicCounts(subjectSlug) {
  console.log(`\n📊 Updating subtopic counts for ${subjectSlug}...`);

  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single();

  if (!subject) {
    console.log('⚠️  Subject not found');
    return;
  }

  const { data: topics } = await supabase
    .from('topics')
    .select('id')
    .eq('subject_id', subject.id);

  if (!topics) return;

  for (const topic of topics) {
    const { data: subtopics } = await supabase
      .from('subtopics')
      .select('id')
      .eq('topic_id', topic.id);

    const count = subtopics?.length || 0;

    await supabase
      .from('topics')
      .update({ subtopic_count: count })
      .eq('id', topic.id);
  }

  console.log('✅ Subtopic counts updated');
}

// Clear Next.js cache
async function clearNextCache() {
  console.log('\n🧹 Clearing Next.js cache...');

  const nextDir = path.join(__dirname, '..', '.next');

  if (fs.existsSync(nextDir)) {
    try {
      await runCommand('rm', ['-rf', nextDir]);
      console.log('✅ Cache cleared');
    } catch (error) {
      console.log('⚠️  Could not clear cache:', error.message);
    }
  } else {
    console.log('✅ No cache to clear');
  }
}

// Check if subject needs content
async function needsContent(subjectSlug) {
  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', subjectSlug)
    .single();

  if (!subject) return false;

  const { data: topics } = await supabase
    .from('topics')
    .select('id')
    .eq('subject_id', subject.id);

  if (!topics || topics.length === 0) return false;

  // Check if any topic has subtopics with content
  for (const topic of topics) {
    const { data: subtopics } = await supabase
      .from('subtopics')
      .select('id')
      .eq('topic_id', topic.id);

    if (!subtopics || subtopics.length === 0) continue;

    // Check if any subtopic has notes
    for (const subtopic of subtopics) {
      const { data: notes } = await supabase
        .from('notes')
        .select('id')
        .eq('subtopic_id', subtopic.id)
        .limit(1);

      if (!notes || notes.length === 0) {
        return true; // Needs content
      }
    }
  }

  return false; // Has content
}

// Process one subject
async function processSubject(subjectSlug) {
  const startTime = Date.now();

  console.log('\n' + '═'.repeat(80));
  console.log(`\n🚀 PROCESSING: ${subjectSlug.toUpperCase()}\n`);
  console.log('═'.repeat(80));

  try {
    // Step 1: Generate content
    console.log('\n📝 STEP 1: Generate Content\n');
    await runCommand('node', ['scripts/generate-subject-content.js', subjectSlug]);

    // Step 2: Update subtopic counts
    await updateSubtopicCounts(subjectSlug);

    // Calculate time
    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    console.log('\n' + '═'.repeat(80));
    console.log(`✅ ${subjectSlug.toUpperCase()} COMPLETE (${duration} minutes)`);
    console.log('═'.repeat(80));

    return { success: true, duration };
  } catch (error) {
    console.error(`\n❌ Failed to process ${subjectSlug}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const customSubjects = args.find(a => a.startsWith('--subjects='))?.replace('--subjects=', '').split(',');
  const resume = args.includes('--resume');
  const skipCache = args.includes('--skip-cache-clear');

  console.log('🎯 BATCH CONTENT GENERATOR\n');
  console.log('═'.repeat(80));

  // Load or initialize progress
  let progress = resume ? loadProgress() : { completed: [], failed: [], startedAt: new Date().toISOString() };

  if (resume && progress.completed.length > 0) {
    console.log('\n📋 Resuming from previous run:');
    console.log(`   Completed: ${progress.completed.join(', ')}`);
    if (progress.failed.length > 0) {
      console.log(`   Failed: ${progress.failed.join(', ')}`);
    }
  }

  // Determine subjects to process
  let subjectsToProcess = customSubjects || DEFAULT_SUBJECTS;

  // Filter out already completed if resuming
  if (resume) {
    subjectsToProcess = subjectsToProcess.filter(s => !progress.completed.includes(s));
  }

  // Check which subjects actually need content
  console.log('\n🔍 Checking which subjects need content...\n');
  const subjectsNeedingContent = [];

  for (const slug of subjectsToProcess) {
    const needs = await needsContent(slug);
    if (needs) {
      console.log(`   ✅ ${slug}: needs content`);
      subjectsNeedingContent.push(slug);
    } else {
      console.log(`   ⏭️  ${slug}: already has content`);
    }
  }

  if (subjectsNeedingContent.length === 0) {
    console.log('\n🎉 All subjects already have content!');
    clearProgress();
    return;
  }

  console.log(`\n📊 Will process ${subjectsNeedingContent.length} subjects:`);
  subjectsNeedingContent.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));

  console.log('\n⏱️  Estimated time: ~2-3 hours per subject');
  console.log(`   Total: ~${subjectsNeedingContent.length * 2}-${subjectsNeedingContent.length * 3} hours\n`);

  // Confirm
  console.log('⚠️  This will make many API calls to Claude and Supabase.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(r => setTimeout(r, 5000));

  console.log('🚀 Starting batch generation...\n');

  const startTime = Date.now();
  const results = [];

  for (let i = 0; i < subjectsNeedingContent.length; i++) {
    const subject = subjectsNeedingContent[i];

    console.log(`\n[${ i + 1}/${subjectsNeedingContent.length}] ${subject}`);

    const result = await processSubject(subject);
    results.push({ subject, ...result });

    if (result.success) {
      progress.completed.push(subject);
    } else {
      progress.failed.push(subject);
    }

    saveProgress(progress);

    // Show progress
    const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
    const avgTime = elapsed / (i + 1);
    const remaining = Math.round(avgTime * (subjectsNeedingContent.length - i - 1));

    console.log(`\n📈 Progress: ${i + 1}/${subjectsNeedingContent.length} subjects`);
    console.log(`   Time elapsed: ${elapsed} minutes`);
    console.log(`   Estimated remaining: ${remaining} minutes\n`);

    // Small delay between subjects
    if (i < subjectsNeedingContent.length - 1) {
      console.log('⏸️  Pausing 30 seconds before next subject...');
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  // Clear Next.js cache once at the end
  if (!skipCache) {
    await clearNextCache();
  }

  // Final report
  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);

  console.log('\n' + '═'.repeat(80));
  console.log('\n🎉 BATCH GENERATION COMPLETE!\n');
  console.log('═'.repeat(80));

  console.log(`\n⏱️  Total time: ${totalTime} minutes (${Math.round(totalTime / 60)} hours)`);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
  successful.forEach(r => {
    console.log(`   - ${r.subject} (${r.duration} min)`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
    failed.forEach(r => {
      console.log(`   - ${r.subject}: ${r.error}`);
    });
    console.log('\n💡 To retry failed subjects, run:');
    console.log(`   node scripts/batch-generate-all.js --subjects=${failed.map(r => r.subject).join(',')}`);
  }

  console.log('\n📋 Next steps:');
  console.log('   1. Review generated SQL files in generated-sql/');
  console.log('   2. Import to Supabase using the SQL Editor');
  console.log('   3. Run validation: node scripts/validate-content.js');
  console.log('   4. Restart dev server: npm run dev\n');

  // Clear progress file
  clearProgress();
}

main().catch(console.error);
