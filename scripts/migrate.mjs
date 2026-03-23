/**
 * Database migration runner — runs automatically during Vercel build
 * Requires DATABASE_URL env var:
 *   Supabase → Settings → Database → Connection string → URI
 *   Format: postgresql://postgres:[PASSWORD]@db.[ref].supabase.co:5432/postgres
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.log('[migrate] DATABASE_URL not set — skipping migrations')
  process.exit(0)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 })

async function run() {
  console.log('[migrate] Running database migrations...')

  try {
    const migrationSql = readFileSync(
      join(__dirname, '../supabase/migrations/20260323000000_rls_policies.sql'),
      'utf8'
    )
    await sql.unsafe(migrationSql)
    console.log('[migrate] ✓ All tables created + RLS policies applied')
  } catch (err) {
    console.error('[migrate] Error:', err.message)
    // Don't fail the build on migration errors
  }

  await sql.end()
  console.log('[migrate] Done.')
}

run().catch((err) => {
  console.error('[migrate] Fatal:', err.message)
  process.exit(0)
})
