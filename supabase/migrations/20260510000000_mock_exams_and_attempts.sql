-- ============================================================
-- Mock exams + attempts
-- Backs the /api/exams/* routes and the /exam UI flow.
-- ============================================================

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

CREATE INDEX IF NOT EXISTS mock_exams_subject_idx ON mock_exams (subject_id);
CREATE INDEX IF NOT EXISTS mock_exams_created_by_idx ON mock_exams (created_by);

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

-- ── 3. Increment RPC ───────────────────────────────────────
-- Called from /api/exams/submit after each successful attempt
CREATE OR REPLACE FUNCTION increment_exam_attempts(exam_id_param uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE mock_exams
  SET total_attempts = total_attempts + 1
  WHERE id = exam_id_param;
$$;

-- ── 4. RLS ─────────────────────────────────────────────────
-- Service-role key (used by API routes) bypasses RLS, but enable + own-row
-- policies so anyone using anon key gets reasonable defaults.
ALTER TABLE mock_exams      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mock_exams_select_all"    ON mock_exams;
DROP POLICY IF EXISTS "exam_attempts_select_own" ON exam_attempts;
DROP POLICY IF EXISTS "exam_attempts_insert_own" ON exam_attempts;

-- Anyone signed in can read mock exam metadata (questions are stripped server-side
-- before reaching client during exam-taking; full row including answers is only ever
-- read by the service-role key in the submit route).
CREATE POLICY "mock_exams_select_all"
  ON mock_exams FOR SELECT
  USING (true);

CREATE POLICY "exam_attempts_select_own"
  ON exam_attempts FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "exam_attempts_insert_own"
  ON exam_attempts FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

GRANT ALL ON mock_exams      TO service_role;
GRANT ALL ON exam_attempts   TO service_role;
GRANT SELECT ON mock_exams   TO authenticated;
GRANT SELECT, INSERT ON exam_attempts TO authenticated;
