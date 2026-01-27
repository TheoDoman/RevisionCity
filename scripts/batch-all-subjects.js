#!/usr/bin/env node

/**
 * BATCH ALL SUBJECTS - Complete System Orchestration
 *
 * Processes all 11 IGCSE subjects with complete content generation
 * Includes progress tracking, error handling, and validation
 *
 * Usage: node scripts/batch-all-subjects.js [options]
 * Options:
 *   --subjects=math,chemistry  Process only specific subjects (comma-separated)
 *   --skip=math,biology        Skip specific subjects
 *   --resume                   Resume from last checkpoint
 *   --validate-only            Only run validation, skip generation
 *   --import-only              Only import existing SQL files
 *
 * Example: node scripts/batch-all-subjects.js
 * Example: node scripts/batch-all-subjects.js --subjects=chemistry,physics
 * Example: node scripts/batch-all-subjects.js --resume
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// All 11 IGCSE subjects
const ALL_SUBJECTS = [
  { name: 'Mathematics', slug: 'mathematics' },
  { name: 'Biology', slug: 'biology' },
  { name: 'Chemistry', slug: 'chemistry' },
  { name: 'Physics', slug: 'physics' },
  { name: 'Computer Science', slug: 'computer-science' },
  { name: 'Economics', slug: 'economics' },
  { name: 'English', slug: 'english' },
  { name: 'Geography', slug: 'geography' },
  { name: 'History', slug: 'history' },
  { name: 'Business Studies', slug: 'business-studies' },
  { name: 'ICT', slug: 'ict' }
];

// Progress tracking
const PROGRESS_FILE = path.join(process.cwd(), '.batch-all-progress.json');

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    } catch (error) {
      console.error('⚠️  Error loading progress file, starting fresh');
      return createNewProgress();
    }
  }
  return createNewProgress();
}

function createNewProgress() {
  return {
    startedAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    subjects: {},
    totalSubjects: 0,
    completedSubjects: 0,
    failedSubjects: 0,
    skippedSubjects: 0
  };
}

function saveProgress(progress) {
  progress.lastUpdate = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function runScript(scriptName, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`🔧 Running: node scripts/${scriptName}.js ${args.join(' ')}`);
    console.log('─'.repeat(70) + '\n');

    const child = spawn('node', [`scripts/${scriptName}.js`, ...args], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, code });
      } else {
        resolve({ success: false, code, error: `Exited with code ${code}` });
      }
    });

    child.on('error', (error) => {
      reject({ success: false, error: error.message });
    });
  });
}

async function checkSubjectStatus(subjectSlug) {
  try {
    const { data: subject } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        slug
      `)
      .eq('slug', subjectSlug)
      .single();

    if (!subject) {
      return { exists: false };
    }

    // Count topics and subtopics
    const { data: topics } = await supabase
      .from('topics')
      .select('id, name')
      .eq('subject_id', subject.id);

    const topicIds = topics?.map(t => t.id) || [];
    let subtopicCount = 0;
    let contentCounts = { notes: 0, flashcards: 0, quizzes: 0, practice: 0, recall: 0 };

    if (topicIds.length > 0) {
      const { data: subtopics } = await supabase
        .from('subtopics')
        .select('id')
        .in('topic_id', topicIds);

      subtopicCount = subtopics?.length || 0;

      if (subtopicCount > 0) {
        const subtopicIds = subtopics.map(st => st.id);

        const [notes, flashcards, quizzes, practice, recall] = await Promise.all([
          supabase.from('notes').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds),
          supabase.from('flashcards').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds),
          supabase.from('quiz_questions').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds),
          supabase.from('practice_questions').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds),
          supabase.from('recall_prompts').select('id', { count: 'exact', head: true }).in('subtopic_id', subtopicIds)
        ]);

        contentCounts = {
          notes: notes.count || 0,
          flashcards: flashcards.count || 0,
          quizzes: quizzes.count || 0,
          practice: practice.count || 0,
          recall: recall.count || 0
        };
      }
    }

    // Check if content seems complete
    const hasContent = contentCounts.notes > 0 &&
                      contentCounts.flashcards > 0 &&
                      contentCounts.quizzes > 0 &&
                      contentCounts.practice > 0 &&
                      contentCounts.recall > 0;

    const isComplete = subtopicCount >= 20 && hasContent; // Assuming ~20+ subtopics is "complete"

    return {
      exists: true,
      subject,
      topicCount: topics?.length || 0,
      subtopicCount,
      contentCounts,
      hasContent,
      isComplete
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function processSubject(subjectInfo, progress, options) {
  const { slug, name } = subjectInfo;

  console.log('\n' + '='.repeat(70));
  console.log(`📚 PROCESSING: ${name}`);
  console.log('='.repeat(70));

  // Initialize subject progress
  if (!progress.subjects[slug]) {
    progress.subjects[slug] = {
      name,
      status: 'pending',
      startedAt: null,
      completedAt: null,
      steps: {
        generation: { status: 'pending', attempts: 0 },
        import: { status: 'pending', attempts: 0 },
        validation: { status: 'pending', attempts: 0 }
      },
      error: null
    };
  }

  const subjectProgress = progress.subjects[slug];

  // Check current status
  const status = await checkSubjectStatus(slug);

  console.log('\n📊 Current Status:');
  console.log(`   Topics: ${status.topicCount || 0}`);
  console.log(`   Subtopics: ${status.subtopicCount || 0}`);
  console.log(`   Content: ${status.hasContent ? '✅' : '❌'}`);
  console.log(`   Complete: ${status.isComplete ? '✅' : '❌'}\n`);

  if (status.isComplete && !options.force) {
    console.log(`✅ ${name} appears complete, skipping generation`);
    console.log(`   Use --force to regenerate`);
    subjectProgress.status = 'skipped';
    progress.skippedSubjects++;
    saveProgress(progress);
    return { success: true, skipped: true };
  }

  subjectProgress.status = 'in_progress';
  subjectProgress.startedAt = new Date().toISOString();
  saveProgress(progress);

  try {
    // Step 1: Generation (unless import-only mode)
    if (!options.importOnly) {
      console.log('\n🎯 Step 1: Content Generation');
      subjectProgress.steps.generation.status = 'in_progress';
      subjectProgress.steps.generation.attempts++;
      saveProgress(progress);

      const genResult = await runScript('generate-full-subject', [slug]);

      if (!genResult.success) {
        throw new Error(`Generation failed: ${genResult.error}`);
      }

      subjectProgress.steps.generation.status = 'completed';
      subjectProgress.steps.generation.completedAt = new Date().toISOString();
      saveProgress(progress);
      console.log('✅ Generation complete');
    } else {
      console.log('\n⏩ Skipping generation (import-only mode)');
      subjectProgress.steps.generation.status = 'skipped';
    }

    // Step 2: Import (unless validate-only mode)
    if (!options.validateOnly) {
      console.log('\n🎯 Step 2: Database Import');
      subjectProgress.steps.import.status = 'in_progress';
      subjectProgress.steps.import.attempts++;
      saveProgress(progress);

      console.log('\n⚠️  MANUAL IMPORT REQUIRED:');
      console.log('─'.repeat(70));
      console.log(`1. Open Supabase SQL Editor`);
      console.log(`2. Find SQL file: generated-sql/${slug}-full-*.sql`);
      console.log(`3. Copy content and paste in SQL Editor`);
      console.log(`4. Run the SQL`);
      console.log(`5. Press ENTER here to continue...`);
      console.log('─'.repeat(70));

      // Wait for user confirmation
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });

      subjectProgress.steps.import.status = 'completed';
      subjectProgress.steps.import.completedAt = new Date().toISOString();
      saveProgress(progress);
      console.log('✅ Import marked complete');
    } else {
      console.log('\n⏩ Skipping import (validate-only mode)');
      subjectProgress.steps.import.status = 'skipped';
    }

    // Step 3: Validation
    console.log('\n🎯 Step 3: Content Validation');
    subjectProgress.steps.validation.status = 'in_progress';
    subjectProgress.steps.validation.attempts++;
    saveProgress(progress);

    const valResult = await runScript('validate-completeness', [slug]);

    if (!valResult.success) {
      console.log('⚠️  Validation found issues, but continuing...');
      subjectProgress.steps.validation.status = 'completed_with_issues';
    } else {
      subjectProgress.steps.validation.status = 'completed';
    }

    subjectProgress.steps.validation.completedAt = new Date().toISOString();
    saveProgress(progress);
    console.log('✅ Validation complete');

    // Mark subject as complete
    subjectProgress.status = 'completed';
    subjectProgress.completedAt = new Date().toISOString();
    progress.completedSubjects++;
    saveProgress(progress);

    console.log(`\n✅ ${name} COMPLETE!\n`);
    return { success: true };

  } catch (error) {
    console.error(`\n❌ Error processing ${name}:`, error.message);
    subjectProgress.status = 'failed';
    subjectProgress.error = error.message;
    progress.failedSubjects++;
    saveProgress(progress);
    return { success: false, error: error.message };
  }
}

function printFinalReport(progress) {
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 BATCH PROCESSING COMPLETE');
  console.log('='.repeat(70) + '\n');

  const duration = new Date() - new Date(progress.startedAt);
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  console.log(`Duration: ${hours}h ${minutes}m`);
  console.log(`Total Subjects: ${progress.totalSubjects}`);
  console.log(`✅ Completed: ${progress.completedSubjects}`);
  console.log(`❌ Failed: ${progress.failedSubjects}`);
  console.log(`⏩ Skipped: ${progress.skippedSubjects}\n`);

  console.log('SUBJECT BREAKDOWN:');
  console.log('─'.repeat(70));

  Object.entries(progress.subjects).forEach(([slug, info]) => {
    let statusIcon = '⏳';
    if (info.status === 'completed') statusIcon = '✅';
    if (info.status === 'failed') statusIcon = '❌';
    if (info.status === 'skipped') statusIcon = '⏩';

    console.log(`${statusIcon} ${info.name}`);

    if (info.status === 'completed') {
      const steps = info.steps;
      console.log(`   Generation: ${steps.generation.status}`);
      console.log(`   Import: ${steps.import.status}`);
      console.log(`   Validation: ${steps.validation.status}`);
    } else if (info.status === 'failed') {
      console.log(`   Error: ${info.error}`);
    }
  });

  console.log('\n' + '='.repeat(70));

  if (progress.failedSubjects === 0) {
    console.log('🎉 ALL SUBJECTS PROCESSED SUCCESSFULLY! 🎉');
  } else {
    console.log('⚠️  SOME SUBJECTS FAILED - Review errors above');
  }

  console.log('='.repeat(70) + '\n');

  console.log('NEXT STEPS:');
  console.log('─'.repeat(70));
  console.log('1. Review validation results for each subject');
  console.log('2. Clear Next.js cache: rm -rf .next');
  console.log('3. Start dev server: npm run dev');
  console.log('4. Test the platform thoroughly');
  console.log('5. Deploy to production\n');
}

async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const options = {
    subjects: null,
    skip: [],
    resume: args.includes('--resume'),
    validateOnly: args.includes('--validate-only'),
    importOnly: args.includes('--import-only'),
    force: args.includes('--force')
  };

  // Parse subject filters
  const subjectsArg = args.find(a => a.startsWith('--subjects='));
  if (subjectsArg) {
    options.subjects = subjectsArg.split('=')[1].split(',').map(s => s.trim());
  }

  const skipArg = args.find(a => a.startsWith('--skip='));
  if (skipArg) {
    options.skip = skipArg.split('=')[1].split(',').map(s => s.trim());
  }

  console.log('\n🚀 BATCH ALL SUBJECTS - Complete System Orchestration');
  console.log('='.repeat(70) + '\n');

  // Load or create progress
  let progress = options.resume ? loadProgress() : createNewProgress();

  // Filter subjects
  let subjectsToProcess = ALL_SUBJECTS;

  if (options.subjects) {
    subjectsToProcess = ALL_SUBJECTS.filter(s =>
      options.subjects.some(slug => s.slug.includes(slug) || s.name.toLowerCase().includes(slug.toLowerCase()))
    );
  }

  if (options.skip.length > 0) {
    subjectsToProcess = subjectsToProcess.filter(s =>
      !options.skip.some(slug => s.slug.includes(slug) || s.name.toLowerCase().includes(slug.toLowerCase()))
    );
  }

  progress.totalSubjects = subjectsToProcess.length;

  console.log('CONFIGURATION:');
  console.log('─'.repeat(70));
  console.log(`Total Subjects: ${subjectsToProcess.length}`);
  console.log(`Resume Mode: ${options.resume ? 'Yes' : 'No'}`);
  console.log(`Validate Only: ${options.validateOnly ? 'Yes' : 'No'}`);
  console.log(`Import Only: ${options.importOnly ? 'Yes' : 'No'}`);
  console.log('\nSubjects to process:');
  subjectsToProcess.forEach((s, i) => console.log(`  ${i + 1}. ${s.name}`));
  console.log('\n');

  // Confirm before starting
  if (!options.resume && !options.validateOnly) {
    console.log('⚠️  This will generate content for all subjects.');
    console.log('   This process may take several hours and cost $50-$100 in API usage.');
    console.log('\nPress ENTER to continue or Ctrl+C to cancel...');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
  }

  console.log('\n🚀 Starting batch processing...\n');

  // Process each subject
  for (let i = 0; i < subjectsToProcess.length; i++) {
    const subject = subjectsToProcess[i];

    console.log(`\n\n${'='.repeat(70)}`);
    console.log(`SUBJECT ${i + 1}/${subjectsToProcess.length}: ${subject.name}`);
    console.log('='.repeat(70));

    // Skip if resuming and already completed
    if (options.resume && progress.subjects[subject.slug]?.status === 'completed') {
      console.log(`✅ Already completed, skipping`);
      continue;
    }

    await processSubject(subject, progress, options);

    // Save progress after each subject
    saveProgress(progress);

    // Small delay between subjects
    if (i < subjectsToProcess.length - 1) {
      console.log('\n⏸️  Pausing 5 seconds before next subject...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Final report
  printFinalReport(progress);

  // Clean up
  if (progress.failedSubjects === 0) {
    console.log('🧹 Clearing Next.js cache...');
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('✅ Cache cleared\n');
    }
  }
}

// Handle stdin for interactive prompts
if (process.stdin.isTTY) {
  process.stdin.setRawMode(false);
}

main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});
