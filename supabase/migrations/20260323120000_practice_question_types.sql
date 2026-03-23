-- ============================================================
-- Practice question types + answer checking
-- Adds question_type / correct_answer to practice_questions
-- Creates practice_question_results table
-- ============================================================

-- ── 1. Extend practice_questions ────────────────────────────
ALTER TABLE practice_questions
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'extended'
    CHECK (question_type IN ('short', 'extended')),
  ADD COLUMN IF NOT EXISTS correct_answer text;   -- only populated for 'short' questions

-- ── 2. Results table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practice_question_results (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text        NOT NULL,
  question_id   text        NOT NULL,   -- practice_questions.id (text FK)
  user_answer   text        NOT NULL,
  is_correct    boolean     NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pqr_user_idx     ON practice_question_results (user_id);
CREATE INDEX IF NOT EXISTS pqr_question_idx ON practice_question_results (question_id);

-- ── 3. RLS ───────────────────────────────────────────────────
ALTER TABLE practice_question_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_pqr_select" ON practice_question_results;
DROP POLICY IF EXISTS "own_pqr_insert" ON practice_question_results;

-- Users can only see their own results
CREATE POLICY "own_pqr_select" ON practice_question_results
  FOR SELECT USING (user_id = auth.uid()::text);

-- Writes go through service_role API route (bypasses RLS) — no INSERT policy needed
-- If you prefer direct authenticated inserts, uncomment the next two lines:
-- CREATE POLICY "own_pqr_insert" ON practice_question_results
--   FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- ── 4. Grants ────────────────────────────────────────────────
GRANT SELECT ON practice_question_results TO authenticated;
-- service_role has full access regardless
