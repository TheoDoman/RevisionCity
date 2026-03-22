import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('=== Fixing Edexcel subject slugs and removing stub subjects ===\n');

  // Step 1: Identify stub subjects (ones with "Practice Questions" subtopics)
  const stubSubjectIds = [
    'cf599e01-c988-4f1c-a2af-541deeba2d1c', // Biology (Edexcel), slug: biology-edexcel
    'da10d60f-785f-4481-9392-b107488c4915', // Mathematics (Edexcel), slug: mathematics-edexcel
    '6fe56dd0-4aa4-4b18-992c-5d57e97ad3c6', // Physics (Edexcel), slug: physics-edexcel
  ];

  // Step 2: Real Edexcel subjects that need slug updates
  const slugUpdates = [
    { id: 'ed000001-0000-0000-0000-000000000002', newSlug: 'biology-edexcel', newName: 'Biology' },
    { id: 'ed000001-0000-0000-0000-000000000003', newSlug: 'chemistry-edexcel', newName: 'Chemistry' },
    { id: 'ed000001-0000-0000-0000-000000000001', newSlug: 'mathematics-edexcel', newName: 'Mathematics' },
    { id: 'ed000001-0000-0000-0000-000000000004', newSlug: 'physics-edexcel', newName: 'Physics' },
  ];

  // --- DELETE STUB SUBJECTS ---
  for (const subjectId of stubSubjectIds) {
    // Get topics for this subject
    const { data: topics } = await supabase.from('topics').select('id').eq('subject_id', subjectId);
    const topicIds = (topics || []).map(t => t.id);

    if (topicIds.length > 0) {
      // Get subtopics
      const { data: subtopics } = await supabase.from('subtopics').select('id').in('topic_id', topicIds);
      const subtopicIds = (subtopics || []).map(s => s.id);

      if (subtopicIds.length > 0) {
        // Delete all content for these subtopics
        await supabase.from('notes').delete().in('subtopic_id', subtopicIds);
        await supabase.from('practice_questions').delete().in('subtopic_id', subtopicIds);
        await supabase.from('recall_prompts').delete().in('subtopic_id', subtopicIds);

        // Delete flashcards via sets
        const { data: fsets } = await supabase.from('flashcard_sets').select('id').in('subtopic_id', subtopicIds);
        const setIds = (fsets || []).map(s => s.id);
        if (setIds.length > 0) await supabase.from('flashcards').delete().in('flashcard_set_id', setIds);
        await supabase.from('flashcard_sets').delete().in('subtopic_id', subtopicIds);

        // Delete quiz questions via quizzes
        const { data: quizzes } = await supabase.from('quizzes').select('id').in('subtopic_id', subtopicIds);
        const quizIds = (quizzes || []).map(q => q.id);
        if (quizIds.length > 0) await supabase.from('quiz_questions').delete().in('quiz_id', quizIds);
        await supabase.from('quizzes').delete().in('subtopic_id', subtopicIds);

        // Delete subtopics
        await supabase.from('subtopics').delete().in('topic_id', topicIds);
      }

      // Delete topics
      await supabase.from('topics').delete().eq('subject_id', subjectId);
    }

    // Delete subject
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) console.error(`  Error deleting subject ${subjectId}:`, error.message);
    else console.log(`  ✅ Deleted stub subject: ${subjectId}`);
  }

  // --- UPDATE REAL EDEXCEL SUBJECTS ---
  for (const update of slugUpdates) {
    const { error } = await supabase
      .from('subjects')
      .update({ slug: update.newSlug, name: update.newName })
      .eq('id', update.id);
    if (error) console.error(`  Error updating ${update.id}:`, error.message);
    else console.log(`  ✅ Updated slug → ${update.newSlug} (name: ${update.newName})`);
  }

  // --- VERIFY ---
  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('id, name, slug, exam_board')
    .order('exam_board, name');

  console.log('\n=== Final subjects state ===');
  for (const s of allSubjects || []) {
    console.log(`  [${s.exam_board}] ${s.name} — slug: ${s.slug}`);
  }
}

main().catch(console.error);
