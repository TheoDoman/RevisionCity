const https = require('https');

const supabaseUrl = 'waqvyqpomedcejrkoikl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcXZ5cXBvbWVkY2VqcmtvaWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODEzNjYxOCwiZXhwIjoyMDgzNzEyNjE4fQ.YcshqsIfUdvHVbNj0g2hADIi-QQW0C5kUQ5UnuQgiW8';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: supabaseUrl,
      path: `/rest/v1/${path}`,
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    // Get Physics subject
    const subjects = await makeRequest('subjects?name=eq.Physics&select=id');
    if (!subjects || subjects.length === 0) {
      throw new Error('Physics subject not found');
    }
    const physicsId = subjects[0].id;
    console.log('Physics ID:', physicsId);

    // Get all Physics topics
    const topics = await makeRequest(`topics?subject_id=eq.${physicsId}&select=id,name`);
    console.log(`Found ${topics.length} topics`);

    // Get all subtopics for these topics
    const topicIds = topics.map(t => t.id).join(',');
    const subtopics = await makeRequest(`subtopics?topic_id=in.(${topicIds})&select=id,name,topic_id&order=name`);

    console.log(`\nFound ${subtopics.length} Physics subtopics:\n`);
    console.log(JSON.stringify(subtopics, null, 2));

    // Write to file
    const fs = require('fs');
    fs.writeFileSync(
      '/Users/theodordoman/Downloads/revision-city 3/physics-subtopics.json',
      JSON.stringify(subtopics, null, 2)
    );
    console.log('\nWritten to physics-subtopics.json');

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
