-- Run this SQL in your Supabase SQL editor to create the revision_plans table

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

CREATE INDEX IF NOT EXISTS revision_plans_user_subject_idx
  ON revision_plans (user_id, subject_id);

CREATE INDEX IF NOT EXISTS revision_plans_user_idx
  ON revision_plans (user_id);
