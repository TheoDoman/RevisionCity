import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchAll<T>(table: string, select: string, batchSize = 1000): Promise<T[]> {
  let all: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + batchSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data as T[]);
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return all;
}

async function main() {
  console.log('Fetching all data (paginated)...');

  const [subjects, topics, allSubtopics, notes, fsets, fcards, quizzes, qquestns, pqs, rps] = await Promise.all([
    fetchAll<any>('subjects', 'id, name, slug, exam_board'),
    fetchAll<any>('topics', 'id, subject_id'),
    fetchAll<any>('subtopics', 'id, topic_id, name'),
    fetchAll<any>('notes', 'subtopic_id'),
    fetchAll<any>('flashcard_sets', 'id, subtopic_id'),
    fetchAll<any>('flashcards', 'id, flashcard_set_id'),
    fetchAll<any>('quizzes', 'id, subtopic_id'),
    fetchAll<any>('quiz_questions', 'id, quiz_id'),
    fetchAll<any>('practice_questions', 'id, subtopic_id'),
    fetchAll<any>('recall_prompts', 'id, subtopic_id'),
  ]);

  console.log(`\n=== ROW COUNTS ===`);
  console.log(`subjects: ${subjects.length}, topics: ${topics.length}, subtopics: ${allSubtopics.length}`);
  console.log(`notes: ${notes.length}, flashcard_sets: ${fsets.length}, flashcards: ${fcards.length}`);
  console.log(`quizzes: ${quizzes.length}, quiz_questions: ${qquestns.length}`);
  console.log(`practice_questions: ${pqs.length}, recall_prompts: ${rps.length}`);

  // Build subject → subtopics map
  const topicsBySubject = new Map<string, string[]>();
  for (const t of topics) {
    if (!topicsBySubject.has(t.subject_id)) topicsBySubject.set(t.subject_id, []);
    topicsBySubject.get(t.subject_id)!.push(t.id);
  }
  const subtopicsByTopic = new Map<string, string[]>();
  for (const s of allSubtopics) {
    if (!subtopicsByTopic.has(s.topic_id)) subtopicsByTopic.set(s.topic_id, []);
    subtopicsByTopic.get(s.topic_id)!.push(s.id);
  }
  const subtopicsBySubject = new Map<string, string[]>();
  for (const [sid, tids] of topicsBySubject) {
    const subs: string[] = [];
    for (const tid of tids) subs.push(...(subtopicsByTopic.get(tid) || []));
    subtopicsBySubject.set(sid, subs);
  }

  // Build content maps (subtopic_id → count)
  const notesMap = new Map<string, number>();
  for (const n of notes) notesMap.set(n.subtopic_id, (notesMap.get(n.subtopic_id) || 0) + 1);

  // Flashcards: subtopic → set → cards
  const fsetMap = new Map<string, string[]>(); // subtopic_id → [set_ids]
  for (const s of fsets) {
    if (!fsetMap.has(s.subtopic_id)) fsetMap.set(s.subtopic_id, []);
    fsetMap.get(s.subtopic_id)!.push(s.id);
  }
  const fcardsPerSet = new Map<string, number>();
  for (const c of fcards) fcardsPerSet.set(c.flashcard_set_id, (fcardsPerSet.get(c.flashcard_set_id) || 0) + 1);
  const flashMap = new Map<string, number>(); // subtopic_id → total card count
  for (const [sid, setIds] of fsetMap) {
    flashMap.set(sid, setIds.reduce((sum, id) => sum + (fcardsPerSet.get(id) || 0), 0));
  }

  // Quiz questions: subtopic → quiz → questions
  const quizMap = new Map<string, string[]>(); // subtopic_id → [quiz_ids]
  for (const q of quizzes) {
    if (!quizMap.has(q.subtopic_id)) quizMap.set(q.subtopic_id, []);
    quizMap.get(q.subtopic_id)!.push(q.id);
  }
  const qqPerQuiz = new Map<string, number>();
  for (const q of qquestns) qqPerQuiz.set(q.quiz_id, (qqPerQuiz.get(q.quiz_id) || 0) + 1);
  const quizQMap = new Map<string, number>(); // subtopic_id → total question count
  for (const [sid, qids] of quizMap) {
    quizQMap.set(sid, qids.reduce((sum, id) => sum + (qqPerQuiz.get(id) || 0), 0));
  }

  const pqMap = new Map<string, number>();
  for (const p of pqs) pqMap.set(p.subtopic_id, (pqMap.get(p.subtopic_id) || 0) + 1);

  const rpMap = new Map<string, number>();
  for (const r of rps) rpMap.set(r.subtopic_id, (rpMap.get(r.subtopic_id) || 0) + 1);

  // Sort: Cambridge first
  const sorted = subjects.sort((a: any, b: any) => {
    if (a.exam_board !== b.exam_board) return a.exam_board === 'cambridge' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  console.log('\n=== CONTENT AUDIT TABLE ===');
  console.log('Subject | Board | Subtopics | Notes | FC | QuizQ | PQ | RP | Issues');
  console.log('--------|-------|-----------|-------|-----|-------|-----|-----|--------');

  let totalEmpty = 0;
  const emptyList: string[] = [];

  for (const subj of sorted) {
    const subs = subtopicsBySubject.get(subj.id) || [];
    let n = 0, f = 0, q = 0, p = 0, r = 0;
    let subsWithNotes = 0, subsWithFC = 0, subsWithQuiz = 0, subsWithPQ = 0, subsWithRP = 0;
    const emptySubs: string[] = [];

    for (const sid of subs) {
      const nc = notesMap.get(sid) || 0;
      const fc = flashMap.get(sid) || 0;
      const qc = quizQMap.get(sid) || 0;
      const pc = pqMap.get(sid) || 0;
      const rc = rpMap.get(sid) || 0;
      n += nc; f += fc; q += qc; p += pc; r += rc;
      if (nc > 0) subsWithNotes++;
      if (fc > 0) subsWithFC++;
      if (qc > 0) subsWithQuiz++;
      if (pc > 0) subsWithPQ++;
      if (rc > 0) subsWithRP++;
      if (nc === 0 && fc === 0 && qc === 0 && pc === 0 && rc === 0) {
        const s = allSubtopics.find((x: any) => x.id === sid);
        emptySubs.push(s?.name || sid);
        totalEmpty++;
      }
    }
    emptyList.push(...emptySubs.map(name => `[${subj.exam_board}] ${subj.name} > ${name}`));

    const flags: string[] = [];
    if (subsWithNotes < subs.length) flags.push(`notes:${subsWithNotes}/${subs.length}`);
    if (subsWithFC < subs.length) flags.push(`fc:${subsWithFC}/${subs.length}`);
    if (subsWithQuiz < subs.length) flags.push(`quiz:${subsWithQuiz}/${subs.length}`);
    if (subsWithPQ < subs.length) flags.push(`pq:${subsWithPQ}/${subs.length}`);
    if (subsWithRP < subs.length) flags.push(`rp:${subsWithRP}/${subs.length}`);
    if (n === 0) flags.push('🚨NO_NOTES');
    if (f === 0) flags.push('🚨NO_FC');
    if (q === 0) flags.push('🚨NO_QUIZ');
    if (p === 0) flags.push('🚨NO_PQ');
    if (r === 0) flags.push('🚨NO_RP');
    const avgFC = subs.length > 0 ? (f / subs.length).toFixed(1) : '0';
    const avgQ = subs.length > 0 ? (q / subs.length).toFixed(1) : '0';

    console.log(`${subj.name.padEnd(30)} | ${subj.exam_board.padEnd(9)} | ${String(subs.length).padEnd(9)} | ${String(n).padEnd(5)} | ${String(f).padEnd(5)} | ${String(q).padEnd(5)} | ${String(p).padEnd(4)} | ${String(r).padEnd(4)} | ${flags.join(', ')}`);
  }

  console.log(`\nTotal subtopics: ${allSubtopics.length}`);
  console.log(`Fully empty subtopics (ALL types missing): ${totalEmpty}`);

  if (emptyList.length > 0) {
    console.log('\n=== FULLY EMPTY SUBTOPICS ===');
    emptyList.forEach(s => console.log(`  ${s}`));
  }

  // Per-subtopic coverage for subjects with gaps
  console.log('\n=== SUBJECTS WITH MISSING CONTENT (subtopic-level) ===');
  for (const subj of sorted) {
    const subs = subtopicsBySubject.get(subj.id) || [];
    const missingByType: Record<string, string[]> = { notes: [], fc: [], quiz: [], pq: [], rp: [] };
    for (const sid of subs) {
      const s = allSubtopics.find((x: any) => x.id === sid);
      const name = s?.name || sid;
      if (!notesMap.has(sid)) missingByType.notes.push(name);
      if ((flashMap.get(sid) || 0) < 10) missingByType.fc.push(name);
      if ((quizQMap.get(sid) || 0) < 15) missingByType.quiz.push(name);
      if ((pqMap.get(sid) || 0) < 8) missingByType.pq.push(name);
      if ((rpMap.get(sid) || 0) < 5) missingByType.rp.push(name);
    }
    const hasGaps = Object.values(missingByType).some(v => v.length > 0);
    if (hasGaps) {
      console.log(`\n[${subj.exam_board}] ${subj.name} (${subs.length} subtopics):`);
      for (const [type, missing] of Object.entries(missingByType)) {
        if (missing.length > 0) {
          console.log(`  ${type} gaps (${missing.length}/${subs.length}): ${missing.slice(0,5).join(', ')}${missing.length > 5 ? ` ... +${missing.length - 5} more` : ''}`);
        }
      }
    }
  }

  // Placeholder check
  console.log('\n=== PLACEHOLDER CHECK ===');
  const { data: placeholderNotes } = await supabase
    .from('notes')
    .select('id, subtopic_id, content')
    .or('content.ilike.%TODO%,content.ilike.%placeholder%,content.ilike.%coming soon%,content.ilike.%[SUBJECT]%,content.ilike.%[TOPIC]%,content.ilike.%lorem ipsum%');
  console.log(`Placeholder/stub notes: ${placeholderNotes?.length || 0}`);
  if (placeholderNotes?.length) {
    for (const n of placeholderNotes.slice(0, 5)) {
      console.log(`  id=${n.id}: ${(n.content || '').substring(0, 150)}`);
    }
  }
}

main().catch(console.error);
