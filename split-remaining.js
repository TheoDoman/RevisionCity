const fs = require('fs');

function splitSQL(file, prefix) {
  const sql = fs.readFileSync(file, 'utf8');
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  const chunkSize = 100;
  const chunks = [];

  for (let i = 0; i < statements.length; i += chunkSize) {
    const chunk = statements.slice(i, i + chunkSize).join(';\n') + ';\n';
    chunks.push(chunk);
  }

  chunks.forEach((chunk, idx) => {
    fs.writeFileSync(`generated-sql/${prefix}-p${idx + 1}.sql`, chunk);
  });

  return chunks.length;
}

const count1 = splitSQL('generated-sql/history-full-2026-01-23.sql', 'history');

console.log(`History: ${count1} parts`);
