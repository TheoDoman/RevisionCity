/**
 * Database migration runner — runs automatically during Vercel build
 * Requires DATABASE_URL env var (Supabase: Settings → Database → Connection String → URI)
 */
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.log('[migrate] DATABASE_URL not set — skipping migrations')
  process.exit(0)
}

const sql = postgres(DATABASE_URL, { ssl: 'require', max: 1 })

const MIGRATIONS = [
  {
    name: 'create_revision_plans',
    sql: `
      CREATE TABLE IF NOT EXISTS revision_plans (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        subject_id text NOT NULL,
        subject_name text NOT NULL,
        exam_board text NOT NULL DEFAULT 'cambridge',
        exam_date timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        weeks_data jsonb NOT NULL DEFAULT '[]'::jsonb,
        checkpoints jsonb NOT NULL DEFAULT '[]'::jsonb,
        grade_progression jsonb NOT NULL DEFAULT '[]'::jsonb,
        target_grade text NOT NULL DEFAULT 'B',
        estimated_final_grade text,
        hours_per_week integer NOT NULL DEFAULT 10,
        total_weeks integer NOT NULL DEFAULT 12,
        last_adjusted_at timestamptz
      );
      CREATE INDEX IF NOT EXISTS revision_plans_user_subject_idx ON revision_plans (user_id, subject_id);
      CREATE INDEX IF NOT EXISTS revision_plans_user_idx ON revision_plans (user_id);
    `,
  },
  {
    name: 'create_mock_exams',
    sql: `
      CREATE TABLE IF NOT EXISTS mock_exams (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        subject_id text NOT NULL,
        subject_name text NOT NULL,
        exam_board text NOT NULL DEFAULT 'cambridge',
        difficulty text NOT NULL DEFAULT 'mixed',
        sections jsonb NOT NULL DEFAULT '[]'::jsonb,
        total_marks integer NOT NULL DEFAULT 0,
        total_time_minutes integer NOT NULL DEFAULT 90,
        created_by text,
        created_at timestamptz NOT NULL DEFAULT now(),
        total_attempts integer NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS mock_exams_subject_idx ON mock_exams (subject_id);
    `,
  },
  {
    name: 'create_exam_attempts',
    sql: `
      CREATE TABLE IF NOT EXISTS exam_attempts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        exam_id uuid REFERENCES mock_exams(id) ON DELETE CASCADE,
        answers jsonb NOT NULL DEFAULT '{}'::jsonb,
        timing_data jsonb NOT NULL DEFAULT '{}'::jsonb,
        marked_for_review text[] DEFAULT '{}',
        score integer,
        max_score integer,
        percentage numeric(5,2),
        grade text,
        analysis jsonb,
        started_at timestamptz NOT NULL DEFAULT now(),
        completed_at timestamptz
      );
      CREATE INDEX IF NOT EXISTS exam_attempts_user_idx ON exam_attempts (user_id);
      CREATE INDEX IF NOT EXISTS exam_attempts_exam_idx ON exam_attempts (exam_id);
    `,
  },
  {
    name: 'create_increment_exam_attempts_rpc',
    sql: `
      CREATE OR REPLACE FUNCTION increment_exam_attempts(exam_id_param uuid)
      RETURNS void LANGUAGE sql AS $$
        UPDATE mock_exams SET total_attempts = total_attempts + 1 WHERE id = exam_id_param;
      $$;
    `,
  },
]

async function run() {
  console.log('[migrate] Running database migrations...')
  for (const migration of MIGRATIONS) {
    try {
      await sql.unsafe(migration.sql)
      console.log(`[migrate] ✓ ${migration.name}`)
    } catch (err) {
      console.error(`[migrate] ✗ ${migration.name}:`, err.message)
      // Don't fail the build on migration errors — log and continue
    }
  }
  await sql.end()
  console.log('[migrate] Done.')
}

run().catch((err) => {
  console.error('[migrate] Fatal:', err.message)
  process.exit(0) // Don't fail Vercel build if migrations fail
})
