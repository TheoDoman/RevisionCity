const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function matchContent() {
  console.log('🔄 MATCHING CONTENT TO SUBTOPICS BY NAME\n');

  // Get all flashcard_sets with their current subtopics
  const { data: sets } = await supabase
    .from('flashcard_sets')
    .select('id, subtopic_id, name');

  console.log(`Processing ${sets.length} flashcard_sets...\n`);

  let matched = 0;
  let alreadyCorrect = 0;
  let notFound = 0;

  for (const set of sets) {
    // Get current subtopic details
    const { data: currentSubtopic } = await supabase
      .from('subtopics')
      .select('name, topic_id')
      .eq('id', set.subtopic_id)
      .single();

    if (!currentSubtopic) {
      console.log(`❌ Current subtopic not found for: ${set.name}`);
      notFound++;
      continue;
    }

    // Get the subject for this subtopic
    const { data: currentTopic } = await supabase
      .from('topics')
      .select('subject_id, name')
      .eq('id', currentSubtopic.topic_id)
      .single();

    // Get all topics for this subject
    const { data: allTopicsForSubject } = await supabase
      .from('topics')
      .select('id')
      .eq('subject_id', currentTopic.subject_id);

    const topicIds = allTopicsForSubject.map(t => t.id);

    // Find other subtopics with same name in the same subject
    const { data: matchingSubtopics } = await supabase
      .from('subtopics')
      .select('id, topic_id')
      .eq('name', currentSubtopic.name)
      .in('topic_id', topicIds);

    // If there are multiple subtopics with same name, we need to pick the "main" one
    // Let's pick the one that has the most associated content (notes, practice_questions)
    let bestMatch = null;
    let maxContent = -1;

    for (const candidate of matchingSubtopics) {
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('subtopic_id', candidate.id);

      const { count: practiceCount } = await supabase
        .from('practice_questions')
        .select('*', { count: 'exact', head: true })
        .eq('subtopic_id', candidate.id);

      const totalContent = (notesCount || 0) + (practiceCount || 0);

      if (totalContent > maxContent) {
        maxContent = totalContent;
        bestMatch = candidate;
      }
    }

    if (bestMatch && bestMatch.id !== set.subtopic_id) {
      // Update flashcard_set to point to the best matching subtopic
      const { error: updateError } = await supabase
        .from('flashcard_sets')
        .update({ subtopic_id: bestMatch.id })
        .eq('id', set.id);

      if (updateError) {
        // Probably unique constraint violation - this subtopic already has a flashcard_set
        // In that case, merge by updating the existing one
        const { data: existingSet } = await supabase
          .from('flashcard_sets')
          .select('id')
          .eq('subtopic_id', bestMatch.id)
          .neq('id', set.id)
          .maybeSingle();

        if (existingSet) {
          // Update flashcards to point to existing set, then delete this set
          await supabase
            .from('flashcards')
            .update({
              flashcard_set_id: existingSet.id,
              subtopic_id: bestMatch.id
            })
            .eq('flashcard_set_id', set.id);

          await supabase
            .from('flashcard_sets')
            .delete()
            .eq('id', set.id);

          console.log(`✓ Merged: ${currentSubtopic.name} (${currentTopic.name} → best match)`);
        }
      } else {
        // Update flashcards too
        await supabase
          .from('flashcards')
          .update({ subtopic_id: bestMatch.id })
          .eq('flashcard_set_id', set.id);

        console.log(`✓ Moved: ${currentSubtopic.name} (${currentTopic.name} → best match)`);
      }

      matched++;
    } else if (bestMatch && bestMatch.id === set.subtopic_id) {
      alreadyCorrect++;
    } else {
      console.log(`⚠️  No match found for: ${currentSubtopic.name}`);
      notFound++;
    }
  }

  // Do the same for quizzes
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, subtopic_id, name');

  console.log(`\nProcessing ${quizzes.length} quizzes...\n`);

  for (const quiz of quizzes) {
    const { data: currentSubtopic } = await supabase
      .from('subtopics')
      .select('name, topic_id')
      .eq('id', quiz.subtopic_id)
      .single();

    if (!currentSubtopic) continue;

    const { data: currentTopic } = await supabase
      .from('topics')
      .select('subject_id')
      .eq('id', currentSubtopic.topic_id)
      .single();

    const { data: allTopicsForSubject } = await supabase
      .from('topics')
      .select('id')
      .eq('subject_id', currentTopic.subject_id);

    const topicIds = allTopicsForSubject.map(t => t.id);

    const { data: matchingSubtopics } = await supabase
      .from('subtopics')
      .select('id, topic_id')
      .eq('name', currentSubtopic.name)
      .in('topic_id', topicIds);

    let bestMatch = null;
    let maxContent = -1;

    for (const candidate of matchingSubtopics) {
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('subtopic_id', candidate.id);

      const { count: practiceCount } = await supabase
        .from('practice_questions')
        .select('*', { count: 'exact', head: true })
        .eq('subtopic_id', candidate.id);

      const totalContent = (notesCount || 0) + (practiceCount || 0);

      if (totalContent > maxContent) {
        maxContent = totalContent;
        bestMatch = candidate;
      }
    }

    if (bestMatch && bestMatch.id !== quiz.subtopic_id) {
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({ subtopic_id: bestMatch.id })
        .eq('id', quiz.id);

      if (updateError) {
        const { data: existingQuiz } = await supabase
          .from('quizzes')
          .select('id')
          .eq('subtopic_id', bestMatch.id)
          .neq('id', quiz.id)
          .maybeSingle();

        if (existingQuiz) {
          await supabase
            .from('quiz_questions')
            .update({
              quiz_id: existingQuiz.id,
              subtopic_id: bestMatch.id
            })
            .eq('quiz_id', quiz.id);

          await supabase
            .from('quizzes')
            .delete()
            .eq('id', quiz.id);
        }
      } else {
        await supabase
          .from('quiz_questions')
          .update({ subtopic_id: bestMatch.id })
          .eq('quiz_id', quiz.id);
      }

      matched++;
    }
  }

  console.log(`\n✅ RESULTS:`);
  console.log(`   Matched and moved: ${matched}`);
  console.log(`   Already correct: ${alreadyCorrect}`);
  console.log(`   Not found: ${notFound}`);
}

matchContent().catch(console.error);
