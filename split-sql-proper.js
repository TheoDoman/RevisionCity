const fs = require('fs');

function splitSQLProperly(file, prefix) {
  const sql = fs.readFileSync(file, 'utf8');

  // Split by semicolons to get complete statements
  const statements = sql.split(';').filter(s => s.trim().length > 0);

  console.log(`${prefix}: ${statements.length} SQL statements`);

  // Group into chunks of ~100 statements each
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

const files = [
  ['generated-sql/physics-full-2026-01-22-final-update.sql', 'physics-new'],
  ['generated-sql/chemistry-full-2026-01-22-final-update.sql', 'chemistry-new'],
  ['generated-sql/biology-full-2026-01-23-clean.sql', 'biology-new'],
  ['generated-sql/mathematics-full-2026-01-23-final-update.sql', 'mathematics-new'],
  ['generated-sql/computer-science-full-2026-01-22-final-update.sql', 'computer-science-new'],
  ['generated-sql/business-studies-full-2026-01-22-final-update.sql', 'business-studies-new'],
  ['generated-sql/economics-full-2026-01-22-final-update.sql', 'economics-new'],
  ['generated-sql/geography-full-2026-01-23-clean.sql', 'geography-new'],
  ['generated-sql/history-full-2026-01-23.sql', 'history-new'],
];

console.log('Creating proper SQL chunks...\n');

files.forEach(([file, name]) => {
  const count = splitSQLProperly(file, name);
  console.log(`  -> ${count} parts\n`);
});

console.log('Done!');
