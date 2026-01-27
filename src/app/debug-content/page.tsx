import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function DebugContentPage() {
  // Get physics
  const { data: physics } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .eq('slug', 'physics')
    .single();

  // Get all physics topics
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, slug')
    .eq('subject_id', physics?.id)
    .order('order_index');

  // Get first topic's subtopics
  const firstTopic = topics?.[0];
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select('id, name, slug')
    .eq('topic_id', firstTopic?.id)
    .order('order_index');

  // Get ALL content for first subtopic
  const firstSubtopic = subtopics?.[0];

  const { data: note } = await supabase
    .from('notes')
    .select('*')
    .eq('subtopic_id', firstSubtopic?.id)
    .maybeSingle();

  const { data: flashcardSet } = await supabase
    .from('flashcard_sets')
    .select('id, name')
    .eq('subtopic_id', firstSubtopic?.id)
    .maybeSingle();

  let flashcards: any[] = [];
  if (flashcardSet) {
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('flashcard_set_id', flashcardSet.id);
    flashcards = data || [];
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, name')
    .eq('subtopic_id', firstSubtopic?.id)
    .maybeSingle();

  let quizQuestions: any[] = [];
  if (quiz) {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz.id);
    quizQuestions = data || [];
  }

  const { data: practiceQuestions } = await supabase
    .from('practice_questions')
    .select('*')
    .eq('subtopic_id', firstSubtopic?.id);

  const { data: recallPrompts } = await supabase
    .from('recall_prompts')
    .select('*')
    .eq('subtopic_id', firstSubtopic?.id);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">🔍 Complete Content Debug</h1>

          {/* Subject Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <h2 className="text-xl font-semibold mb-2">Subject</h2>
            <p><strong>Name:</strong> {physics?.name}</p>
            <p><strong>ID:</strong> {physics?.id}</p>
          </div>

          {/* Topics */}
          <div className="mb-6 p-4 bg-green-50 rounded">
            <h2 className="text-xl font-semibold mb-2">Topics ({topics?.length})</h2>
            <div className="grid grid-cols-2 gap-2">
              {topics?.map(t => (
                <div key={t.id} className="text-sm bg-white p-2 rounded border">
                  {t.name} <span className="text-gray-500">({t.slug})</span>
                </div>
              ))}
            </div>
          </div>

          {/* First Topic Info */}
          <div className="mb-6 p-4 bg-purple-50 rounded">
            <h2 className="text-xl font-semibold mb-2">First Topic: {firstTopic?.name}</h2>
            <p><strong>ID:</strong> {firstTopic?.id}</p>
            <p><strong>Slug:</strong> {firstTopic?.slug}</p>
          </div>

          {/* Subtopics */}
          <div className="mb-6 p-4 bg-yellow-50 rounded">
            <h2 className="text-xl font-semibold mb-2">Subtopics ({subtopics?.length})</h2>
            {subtopics?.map(st => (
              <div key={st.id} className="text-sm bg-white p-2 rounded border mb-2">
                <strong>{st.name}</strong> <span className="text-gray-500">({st.slug})</span>
                <br />
                <span className="text-xs text-gray-400">ID: {st.id}</span>
              </div>
            ))}
          </div>

          {/* CONTENT FOR FIRST SUBTOPIC */}
          <div className="mb-6 p-4 bg-red-50 rounded">
            <h2 className="text-2xl font-bold mb-4">📚 Content for: {firstSubtopic?.name}</h2>
            <p className="text-sm text-gray-600 mb-4">Subtopic ID: {firstSubtopic?.id}</p>

            {/* Notes */}
            <div className="mb-4 p-3 bg-white rounded border">
              <h3 className="font-semibold mb-2">📝 Notes: {note ? 'YES' : 'NO'}</h3>
              {note && (
                <>
                  <p className="text-sm"><strong>Title:</strong> {note.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Content length: {note.content?.length || 0} chars
                  </p>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs max-h-32 overflow-auto">
                    {note.content?.substring(0, 500)}...
                  </div>
                </>
              )}
            </div>

            {/* Flashcards */}
            <div className="mb-4 p-3 bg-white rounded border">
              <h3 className="font-semibold mb-2">🎴 Flashcards: {flashcards.length}</h3>
              {flashcardSet && (
                <p className="text-sm mb-2">
                  <strong>Set:</strong> {flashcardSet.name} (ID: {flashcardSet.id})
                </p>
              )}
              {flashcards.slice(0, 3).map((f, i) => (
                <div key={i} className="text-sm bg-gray-50 p-2 rounded mb-2">
                  <p><strong>Q:</strong> {f.front}</p>
                  <p className="text-gray-600"><strong>A:</strong> {f.back}</p>
                </div>
              ))}
              {flashcards.length > 3 && (
                <p className="text-xs text-gray-500">...and {flashcards.length - 3} more</p>
              )}
            </div>

            {/* Quiz */}
            <div className="mb-4 p-3 bg-white rounded border">
              <h3 className="font-semibold mb-2">❓ Quiz Questions: {quizQuestions.length}</h3>
              {quiz && (
                <p className="text-sm mb-2">
                  <strong>Quiz:</strong> {quiz.name} (ID: {quiz.id})
                </p>
              )}
              {quizQuestions.slice(0, 2).map((q, i) => (
                <div key={i} className="text-sm bg-gray-50 p-2 rounded mb-2">
                  <p><strong>Q:</strong> {q.question}</p>
                  <p className="text-xs text-gray-600">Answer: {q.correct_answer}</p>
                </div>
              ))}
              {quizQuestions.length > 2 && (
                <p className="text-xs text-gray-500">...and {quizQuestions.length - 2} more</p>
              )}
            </div>

            {/* Practice Questions */}
            <div className="mb-4 p-3 bg-white rounded border">
              <h3 className="font-semibold mb-2">✍️ Practice Questions: {practiceQuestions?.length || 0}</h3>
              {practiceQuestions?.slice(0, 2).map((q, i) => (
                <div key={i} className="text-sm bg-gray-50 p-2 rounded mb-2">
                  <p>{q.question}</p>
                  <p className="text-xs text-gray-500">Marks: {q.marks}</p>
                </div>
              ))}
            </div>

            {/* Recall Prompts */}
            <div className="mb-4 p-3 bg-white rounded border">
              <h3 className="font-semibold mb-2">💭 Recall Prompts: {recallPrompts?.length || 0}</h3>
              {recallPrompts?.slice(0, 2).map((r, i) => (
                <div key={i} className="text-sm bg-gray-50 p-2 rounded mb-2">
                  <p>{r.prompt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
            <h2 className="text-xl font-bold mb-2">✅ Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Structure:</p>
                <ul className="text-sm">
                  <li>✅ Subject: {physics?.name}</li>
                  <li>✅ Topics: {topics?.length}</li>
                  <li>✅ Subtopics: {subtopics?.length}</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Content:</p>
                <ul className="text-sm">
                  <li>{note ? '✅' : '❌'} Notes</li>
                  <li>{flashcards.length > 0 ? '✅' : '❌'} Flashcards ({flashcards.length})</li>
                  <li>{quizQuestions.length > 0 ? '✅' : '❌'} Quiz ({quizQuestions.length})</li>
                  <li>{practiceQuestions && practiceQuestions.length > 0 ? '✅' : '❌'} Practice ({practiceQuestions?.length})</li>
                  <li>{recallPrompts && recallPrompts.length > 0 ? '✅' : '❌'} Recall ({recallPrompts?.length})</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
