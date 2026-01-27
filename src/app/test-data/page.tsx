import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function TestDataPage() {
  // Fetch subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('name, slug')
    .order('name');

  // Fetch physics topics
  const { data: physics } = await supabase
    .from('subjects')
    .select('id')
    .eq('slug', 'physics')
    .single();

  const { data: physicsTopics } = await supabase
    .from('topics')
    .select('name, slug')
    .eq('subject_id', physics?.id)
    .order('order_index');

  // Get first subtopic with content
  const { data: firstTopic } = await supabase
    .from('topics')
    .select('id')
    .eq('subject_id', physics?.id)
    .order('order_index')
    .limit(1)
    .single();

  const { data: subtopics } = await supabase
    .from('subtopics')
    .select('id, name, slug')
    .eq('topic_id', firstTopic?.id);

  const { data: notes } = await supabase
    .from('notes')
    .select('title, content')
    .eq('subtopic_id', subtopics?.[0]?.id)
    .single();

  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('front, back')
    .eq('subtopic_id', subtopics?.[0]?.id)
    .limit(3);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Database Content Test</h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">✅ Subjects ({subjects?.length || 0})</h2>
              <div className="grid grid-cols-3 gap-2">
                {subjects?.map(s => (
                  <div key={s.slug} className="text-sm bg-gray-100 p-2 rounded">
                    {s.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">✅ Physics Topics ({physicsTopics?.length || 0})</h2>
              <div className="grid grid-cols-2 gap-2">
                {physicsTopics?.map(t => (
                  <div key={t.slug} className="text-sm bg-blue-100 p-2 rounded">
                    {t.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">✅ First Topic Subtopics ({subtopics?.length || 0})</h2>
              <div className="space-y-2">
                {subtopics?.map(st => (
                  <div key={st.slug} className="text-sm bg-green-100 p-2 rounded">
                    {st.name}
                  </div>
                ))}
              </div>
            </div>

            {notes && (
              <div>
                <h2 className="text-xl font-semibold mb-2">✅ Sample Note</h2>
                <div className="bg-purple-50 p-4 rounded">
                  <h3 className="font-semibold mb-2">{notes.title}</h3>
                  <div className="text-sm text-gray-700 line-clamp-3">
                    {notes.content?.substring(0, 200)}...
                  </div>
                </div>
              </div>
            )}

            {flashcards && flashcards.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">✅ Sample Flashcards ({flashcards.length})</h2>
                <div className="space-y-2">
                  {flashcards.map((f, i) => (
                    <div key={i} className="bg-yellow-50 p-3 rounded">
                      <div className="font-semibold text-sm mb-1">Q: {f.front}</div>
                      <div className="text-sm text-gray-600">A: {f.back}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
