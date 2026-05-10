-- ============================================================
-- Idempotent re-applies for revision_plans and user_activity.
-- Both tables have free-floating .sql files at repo root that
-- may or may not have been applied. This migration ensures the
-- schemas exist regardless of prior history.
-- ============================================================

-- ── revision_plans ─────────────────────────────────────────
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

ALTER TABLE revision_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "revision_plans_select_own" ON revision_plans;
DROP POLICY IF EXISTS "revision_plans_insert_own" ON revision_plans;
DROP POLICY IF EXISTS "revision_plans_update_own" ON revision_plans;
DROP POLICY IF EXISTS "revision_plans_delete_own" ON revision_plans;

CREATE POLICY "revision_plans_select_own"
  ON revision_plans FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "revision_plans_insert_own"
  ON revision_plans FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "revision_plans_update_own"
  ON revision_plans FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "revision_plans_delete_own"
  ON revision_plans FOR DELETE
  USING (user_id = auth.uid()::text);

GRANT ALL ON revision_plans                      TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON revision_plans TO authenticated;

-- ── user_activity ──────────────────────────────────────────
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

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_activity_select_own" ON user_activity;
DROP POLICY IF EXISTS "user_activity_insert_own" ON user_activity;

CREATE POLICY "user_activity_select_own"
  ON user_activity FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "user_activity_insert_own"
  ON user_activity FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

GRANT ALL ON user_activity                  TO service_role;
GRANT SELECT, INSERT ON user_activity       TO authenticated;
