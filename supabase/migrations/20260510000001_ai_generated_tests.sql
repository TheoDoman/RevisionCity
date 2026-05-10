-- ============================================================
-- AI-generated practice tests
-- Persists every test produced by /api/ai/generate-test so users
-- can revisit, retake, and review past tests.
-- ============================================================

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
  -- Full test JSON: { questions: [...], metadata: {...} }
  -- Stored with answers + explanations so users can review later.
  test_data       jsonb       NOT NULL,
  -- Latest score the user got (when they take/retake the test).
  last_score      integer,
  last_max_score  integer,
  last_taken_at   timestamptz,
  attempt_count   integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_tests_user_idx     ON ai_generated_tests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_tests_subject_idx  ON ai_generated_tests (subject_id);

ALTER TABLE ai_generated_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_tests_select_own" ON ai_generated_tests;
DROP POLICY IF EXISTS "ai_tests_insert_own" ON ai_generated_tests;
DROP POLICY IF EXISTS "ai_tests_update_own" ON ai_generated_tests;

CREATE POLICY "ai_tests_select_own"
  ON ai_generated_tests FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "ai_tests_insert_own"
  ON ai_generated_tests FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "ai_tests_update_own"
  ON ai_generated_tests FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

GRANT ALL ON ai_generated_tests             TO service_role;
GRANT SELECT, INSERT, UPDATE ON ai_generated_tests TO authenticated;
