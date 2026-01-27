// Temporary debug page
import { getTopicWithSubtopics } from '@/lib/data';

export default async function DebugPage() {
  const data = await getTopicWithSubtopics('mathematics', 'number');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Output</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
