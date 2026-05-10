/**
 * Database migration runner — runs automatically during Vercel build.
 * Applies every .sql file in supabase/migrations/ in filename order.
 * Idempotent: each migration uses CREATE ... IF NOT EXISTS / ALTER ... ADD COLUMN IF NOT EXISTS.
 *
 * Requires DATABASE_URL env var:
 *   Supabase → Settings → Database → Connection string → URI
 *   Format: postgresql://postgres:[PASSWORD]@db.[ref].supabase.co:5432/postgres
 */
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.log('[migrate] DATABASE_URL not set — skipping migrations')
  process.exit(0)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '../supabase/migrations')
const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 })

async function run() {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort() // chronological by filename prefix (YYYYMMDDHHMMSS_)

  console.log(`[migrate] Applying ${files.length} migration(s)...`)

  for (const file of files) {
    try {
      const migrationSql = readFileSync(join(migrationsDir, file), 'utf8')
      await sql.unsafe(migrationSql)
      console.log(`[migrate] ✓ ${file}`)
    } catch (err) {
      console.error(`[migrate] ✗ ${file}: ${err.message}`)
      // Don't fail the build — failed migrations should be investigated but
      // shouldn't block deploys (they're idempotent and can be retried).
    }
  }

  await sql.end()
  console.log('[migrate] Done.')
}

run().catch((err) => {
  console.error('[migrate] Fatal:', err.message)
  process.exit(0)
})
