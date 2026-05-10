-- ============================================================================
-- One-shot DB setup for mock exams, AI generated tests, study plans.
--
-- HOW TO RUN:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire file and click Run
--
-- This is idempotent — every CREATE uses IF NOT EXISTS / OR REPLACE.
-- Safe to re-run if anything fails partway through.
--
-- If you set DATABASE_URL in your Vercel project's env vars, the next deploy
-- runs all migrations in supabase/migrations/ automatically (via
-- scripts/migrate.mjs at build time). This file is a manual fallback.
-- ============================================================================

-- ── 1. mock_exams ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mock_exams (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id          text        NOT NULL,
  subject_name        text        NOT NULL,
  exam_board          text        NOT NULL CHECK (exam_board IN ('cambridge', 'edexcel')),
  difficulty          text        NOT NULL DEFAULT 'mixed'
                                  CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
  sections            jsonb       NOT NULL DEFAULT '[]'::jsonb,
  total_marks         integer     NOT NULL DEFAULT 0,
  total_time_minutes  integer     NOT NULL DEFAULT 60,
  total_attempts      integer     NOT NULL DEFAULT 0,
  created_by          text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mock_exams_subject_idx     ON mock_exams (subject_id);
CREATE INDEX IF NOT EXISTS mock_exams_created_by_idx  ON mock_exams (created_by);

-- ── 2. exam_attempts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_attempts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             text        NOT NULL,
  exam_id             uuid        NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  answers             jsonb       NOT NULL DEFAULT '{}'::jsonb,
  timing_data         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  marked_for_review   jsonb       NOT NULL DEFAULT '[]'::jsonb,
  score               integer,
  max_score           integer,
  percentage          numeric(5, 2),
  grade               text,
  analysis            jsonb,
  started_at          timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exam_attempts_user_idx        ON exam_attempts (user_id);
CREATE INDEX IF NOT EXISTS exam_attempts_exam_idx        ON exam_attempts (exam_id);
CREATE INDEX IF NOT EXISTS exam_attempts_user_completed  ON exam_attempts (user_id, completed_at DESC);

-- ── 3. RPC: increment_exam_attempts ────────────────────────
CREATE OR REPLACE FUNCTION increment_exam_attempts(exam_id_param uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE mock_exams
  SET total_attempts = total_attempts + 1
  WHERE id = exam_id_param;
$$;

-- ── 4. AI-generated tests ──────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_generated_tests (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text        NOT NULL,
  subject_id      uuid,
  subject_name    text        NOT NULL,
  topic_id        uuid,
  topic_name      text        NOT NULL,
  exam_board      text        NOT NULL DEFAULT 'cambridge'
                              CHECK (exam_board IN ('cambridge', 'edexcel')),
  difficulty      integer     NOT NULL CHECK (difficulty BETWEEN 1 AND 10),
  question_count  integer     NOT NULL CHECK (question_count BETWEEN 1 AND 30),
  total_marks     integer     NOT NULL DEFAULT 0,
  test_data       jsonb       NOT NULL,
  last_score      integer,
  last_max_score  integer,
  last_taken_at   timestamptz,
  attempt_count   integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_tests_user_idx     ON ai_generated_tests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_tests_subject_idx  ON ai_generated_tests (subject_id);

-- ── 5. Revision plans (idempotent re-apply) ────────────────
CREATE TABLE IF NOT EXISTS revision_plans (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  text        NOT NULL,
  subject_id               text        NOT NULL,
  subject_name             text        NOT NULL,
  exam_board               text        NOT NULL DEFAULT 'cambridge',
  exam_date                timestamptz NOT NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  weeks_data               jsonb       NOT NULL DEFAULT '[]'::jsonb,
  checkpoints              jsonb       NOT NULL DEFAULT '[]'::jsonb,
  grade_progression        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  target_grade             text        NOT NULL DEFAULT 'B',
  estimated_final_grade    text,
  hours_per_week           integer     NOT NULL DEFAULT 10,
  total_weeks              integer     NOT NULL DEFAULT 12,
  last_adjusted_at         timestamptz
);

CREATE INDEX IF NOT EXISTS revision_plans_user_subject_idx ON revision_plans (user_id, subject_id);
CREATE INDEX IF NOT EXISTS revision_plans_user_idx         ON revision_plans (user_id);

-- ── 6. User activity (idempotent re-apply, no FK so exam logging works) ──
CREATE TABLE IF NOT EXISTS user_activity (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text        NOT NULL,
  activity_type text        NOT NULL CHECK (activity_type IN ('quiz', 'flashcard', 'note', 'practice', 'recall', 'test')),
  subject_id    uuid,
  topic_id      uuid,
  subtopic_id   uuid,
  score         integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id     ON user_activity (user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at  ON user_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_type        ON user_activity (activity_type);

-- ── 7. RLS + policies ──────────────────────────────────────
-- Service-role key (used by API routes) bypasses RLS, but we enable it
-- so anon-key direct DB access from clients gets reasonable defaults.

ALTER TABLE mock_exams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_plans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mock_exams_select_all"     ON mock_exams;
DROP POLICY IF EXISTS "exam_attempts_select_own"  ON exam_attempts;
DROP POLICY IF EXISTS "exam_attempts_insert_own"  ON exam_attempts;
DROP POLICY IF EXISTS "ai_tests_select_own"       ON ai_generated_tests;
DROP POLICY IF EXISTS "ai_tests_insert_own"       ON ai_generated_tests;
DROP POLICY IF EXISTS "ai_tests_update_own"       ON ai_generated_tests;
DROP POLICY IF EXISTS "revision_plans_select_own" ON revision_plans;
DROP POLICY IF EXISTS "revision_plans_insert_own" ON revision_plans;
DROP POLICY IF EXISTS "revision_plans_update_own" ON revision_plans;
DROP POLICY IF EXISTS "revision_plans_delete_own" ON revision_plans;
DROP POLICY IF EXISTS "user_activity_select_own"  ON user_activity;
DROP POLICY IF EXISTS "user_activity_insert_own"  ON user_activity;

CREATE POLICY "mock_exams_select_all"
  ON mock_exams FOR SELECT USING (true);

CREATE POLICY "exam_attempts_select_own"
  ON exam_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "exam_attempts_insert_own"
  ON exam_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "ai_tests_select_own"
  ON ai_generated_tests FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "ai_tests_insert_own"
  ON ai_generated_tests FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "ai_tests_update_own"
  ON ai_generated_tests FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "revision_plans_select_own"
  ON revision_plans FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "revision_plans_insert_own"
  ON revision_plans FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "revision_plans_update_own"
  ON revision_plans FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "revision_plans_delete_own"
  ON revision_plans FOR DELETE USING (user_id = auth.uid()::text);

CREATE POLICY "user_activity_select_own"
  ON user_activity FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "user_activity_insert_own"
  ON user_activity FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- ── 8. Grants ──────────────────────────────────────────────
GRANT ALL    ON mock_exams          TO service_role;
GRANT SELECT ON mock_exams          TO authenticated;

GRANT ALL                  ON exam_attempts   TO service_role;
GRANT SELECT, INSERT       ON exam_attempts   TO authenticated;

GRANT ALL                       ON ai_generated_tests TO service_role;
GRANT SELECT, INSERT, UPDATE    ON ai_generated_tests TO authenticated;

GRANT ALL                              ON revision_plans TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE   ON revision_plans TO authenticated;

GRANT ALL              ON user_activity TO service_role;
GRANT SELECT, INSERT   ON user_activity TO authenticated;
